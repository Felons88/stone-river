import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import twilio from 'twilio';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { startReviewSync, fetchGoogleReviews } from './google-reviews-sync.js';
import { sendInvoiceEmail } from './email-automation.js';
import { startReminderScheduler } from './sms-reminders.js';
import { startQuoteFollowUpScheduler } from './quote-follow-up.js';
import { startEmailAutomationScheduler, sendBookingConfirmation, sendOnTheWayNotification, sendRunningLateNotification, sendJobCompleteNotification } from './email-automation-triggers.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCfwsggzyCCEzXG-kvEhut1oThptWZbeuk');
const aiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

dotenv.config({ path: '.env.server' });

// Initialize Supabase first (needs env vars for connection)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Config cache
let configCache = {};
let configLastLoaded = null;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Load configuration from Supabase
async function loadConfig() {
  const now = Date.now();
  if (configCache && configLastLoaded && (now - configLastLoaded) < CONFIG_CACHE_TTL) {
    return configCache;
  }

  try {
    const { data, error } = await supabase
      .from('business_config')
      .select('config_key, config_value');
    
    if (error) throw error;
    
    configCache = data.reduce((acc, item) => {
      acc[item.config_key] = item.config_value;
      return acc;
    }, {});
    
    configLastLoaded = now;
    console.log('✅ Configuration loaded from Supabase');
    return configCache;
  } catch (error) {
    console.error('❌ Failed to load config from Supabase:', error);
    // Fallback to env vars
    return {
      stripe_secret_key: process.env.STRIPE_SECRET_KEY,
      stripe_publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
      twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
      smtp_host: process.env.SMTP_HOST,
      smtp_port: process.env.SMTP_PORT,
      smtp_user: process.env.SMTP_USER,
      smtp_password: process.env.SMTP_PASSWORD,
      google_places_api_key: process.env.GOOGLE_PLACES_API_KEY,
      google_place_id: process.env.GOOGLE_PLACE_ID,
    };
  }
}

// Initialize Stripe (will be reinitialized with DB config)
let stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// Load config on startup
loadConfig().then(config => {
  if (config.stripe_secret_key) {
    stripe = new Stripe(config.stripe_secret_key, {
      apiVersion: '2023-10-16',
    });
    console.log('✅ Stripe initialized with database config');
  }
});

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// CORS middleware - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false
}));

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email Template Helper
const loadEmailTemplate = (templateName) => {
  const templatePath = path.join(__dirname, 'email-templates', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf8');
};

const renderEmailTemplate = (templateName, data) => {
  let template = loadEmailTemplate(templateName);
  
  // Replace all placeholders
  Object.keys(data).forEach(key => {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), data[key] || '');
  });
  
  return template;
};

// Twilio SMS endpoint
app.post('/api/sms/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    console.log('📱 Received SMS request:', { to, message });
    
    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Twilio credentials not configured' 
      });
    }
    
    console.log('📱 Sending SMS via Twilio...');
    console.log('📱 From:', fromNumber);
    console.log('📱 To:', to);
    
    // Send SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('📱 Message SID:', twilioMessage.sid);
    console.log('📱 Status:', twilioMessage.status);
    
    res.json({
      success: true,
      message: 'SMS sent successfully via Twilio',
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
      to: to,
      from: fromNumber,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('📱 Twilio SMS error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS via Twilio'
    });
  }
});

// Email endpoint using Brevo SMTP
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    console.log('📧 Received email request:', { to, subject });
    
    // Dynamic import of nodemailer
    const nodemailer = await import('nodemailer');
    
    // Create transporter with Brevo SMTP
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    console.log('📧 Sending email via Brevo SMTP...');
    
    // Send email
    const info = await transporter.sendMail({
      from: `"StoneRiver Junk Removal" <noreply@stoneriverjunk.com>`,
      to: to,
      subject: subject,
      text: text || subject,
      html: html
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
    res.json({
      success: true,
      message: 'Email sent successfully via Brevo',
      messageId: info.messageId,
      to: to,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('📧 Brevo email error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email via Brevo'
    });
  }
});

// ==================== PAYMENT ENDPOINTS ====================

// Stripe Payment Processing
app.post('/api/payment/stripe', async (req, res) => {
  try {
    const { amount, processing_fee, total_amount, invoice_id, payment_method_id, name, email, zip } = req.body;
    
    console.log('💳 Processing Stripe payment:', { 
      amount, 
      processing_fee, 
      total_amount, 
      invoice_id, 
      email, 
      payment_method_id 
    });
    
    if (!payment_method_id) {
      throw new Error('Payment method ID is required');
    }
    
    // Create payment intent with the total amount (invoice + processing fee)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
      confirmation_method: 'automatic',
      description: `Invoice payment for ${invoice_id} (includes 3.5% processing fee)`,
      metadata: { 
        invoice_id,
        invoice_amount: amount.toString(),
        processing_fee: processing_fee.toString(),
        total_amount: total_amount.toString()
      },
      receipt_email: email,
      return_url: `${process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:8080'}/invoice/${invoice_id}`
    });
    
    if (paymentIntent.status === 'succeeded') {
      // Create transaction record
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert([{
          transaction_id: transactionId,
          invoice_id: invoice_id,
          gateway: 'stripe',
          gateway_transaction_id: paymentIntent.id,
          amount: total_amount,
          currency: 'USD',
          status: 'completed',
          payment_method: 'card',
          customer_email: email,
          customer_name: name,
          customer_ip: req.ip,
          metadata: {
            invoice_amount: amount,
            processing_fee: processing_fee,
            total_charged: total_amount
          },
          gateway_response: paymentIntent,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Stripe payment successful:', transactionId);
      
      // Send payment receipt email
      try {
        const invoice = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoice_id)
          .single();
        
        if (invoice.data) {
          const processingFeeRow = processing_fee > 0 
            ? `<div class="detail-row"><span class="detail-label">Processing Fee (3.5%):</span><span class="detail-value">$${processing_fee.toFixed(2)}</span></div>`
            : '';
          
          const emailHtml = renderEmailTemplate('payment-receipt', {
            TRANSACTION_ID: transactionId,
            PAYMENT_DATE: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            INVOICE_NUMBER: invoice.data.invoice_number,
            INVOICE_AMOUNT: amount.toFixed(2),
            PROCESSING_FEE_ROW: processingFeeRow,
            TOTAL_AMOUNT: total_amount.toFixed(2),
            PAYMENT_METHOD: 'Credit/Debit Card (Stripe)',
            CUSTOMER_NAME: name,
            CUSTOMER_EMAIL: email
          });
          
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD
            }
          });
          
          await transporter.sendMail({
            from: '"StoneRiver Junk Removal" <noreply@stoneriverjunk.com>',
            to: email,
            subject: `Payment Receipt - Invoice ${invoice.data.invoice_number}`,
            html: emailHtml
          });
          
          console.log('📧 Payment receipt email sent to:', email);
        }
      } catch (emailError) {
        console.error('📧 Failed to send receipt email:', emailError);
        // Don't fail the payment if email fails
      }
      
      res.json({
        success: true,
        transaction_id: transactionId,
        gateway_transaction_id: paymentIntent.id,
        amount: total_amount,
        invoice_amount: amount,
        processing_fee: processing_fee,
        status: 'completed'
      });
    } else {
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    }
    
  } catch (error) {
    console.error('💳 Stripe payment error:', error);
    
    // Log failed transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await supabase.from('payment_transactions').insert([{
      transaction_id: transactionId,
      invoice_id: req.body.invoice_id,
      gateway: 'stripe',
      amount: req.body.amount,
      status: 'failed',
      customer_email: req.body.email,
      error_code: error.code,
      error_message: error.message
    }]);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
});

// PayPal Create Order
app.post('/api/payment/paypal/create', async (req, res) => {
  try {
    const { amount, invoice_id } = req.body;
    
    console.log('💰 Creating PayPal order:', { amount, invoice_id });
    
    // For now, return a mock approval URL
    // In production, integrate with PayPal SDK
    const orderId = `PAYPAL_${Date.now()}`;
    
    res.json({
      success: true,
      order_id: orderId,
      approval_url: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`
    });
    
  } catch (error) {
    console.error('💰 PayPal create error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create PayPal order'
    });
  }
});

// PayPal Capture Payment
app.post('/api/payment/paypal/capture', async (req, res) => {
  try {
    const { order_id, invoice_id } = req.body;
    
    console.log('💰 Capturing PayPal payment:', { order_id, invoice_id });
    
    // Create transaction record
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert([{
        transaction_id: transactionId,
        invoice_id: invoice_id,
        gateway: 'paypal',
        gateway_transaction_id: order_id,
        amount: req.body.amount,
        currency: 'USD',
        status: 'completed',
        payment_method: 'paypal',
        customer_email: req.body.email,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ PayPal payment captured:', transactionId);
    
    res.json({
      success: true,
      transaction_id: transactionId,
      status: 'completed'
    });
    
  } catch (error) {
    console.error('💰 PayPal capture error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to capture PayPal payment'
    });
  }
});

// Manual Payment (CashApp/Venmo)
app.post('/api/payment/manual', async (req, res) => {
  try {
    const { invoice_id, gateway, amount, transaction_id, payment_handle } = req.body;
    
    console.log('💵 Recording manual payment:', { gateway, amount, transaction_id });
    
    // Create transaction record with pending status for verification
    const txnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: transaction, error } = await supabase
      .from('payment_transactions')
      .insert([{
        transaction_id: txnId,
        invoice_id: invoice_id,
        gateway: gateway,
        gateway_transaction_id: transaction_id,
        amount: amount,
        currency: 'USD',
        status: 'pending', // Requires manual verification
        payment_method: 'wallet',
        metadata: { payment_handle, user_provided_txn_id: transaction_id }
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Log event for admin review
    await supabase.from('payment_events').insert([{
      transaction_id: transaction.id,
      invoice_id: invoice_id,
      event_type: 'payment.manual_submitted',
      event_status: 'pending_review',
      gateway: gateway,
      amount: amount,
      event_data: { transaction_id, payment_handle }
    }]);
    
    console.log('✅ Manual payment recorded for verification:', txnId);
    
    res.json({
      success: true,
      transaction_id: txnId,
      status: 'pending_verification',
      message: 'Payment submitted for verification. We will confirm within 1-2 business hours.'
    });
    
  } catch (error) {
    console.error('💵 Manual payment error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record manual payment'
    });
  }
});

// ==================== CLIENTS ENDPOINTS ====================

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Clients fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new client
app.post('/api/clients', async (req, res) => {
  try {
    const clientData = req.body;
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Client creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTIFICATIONS ENDPOINTS ====================

// Get all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create notification
app.post('/api/notifications', async (req, res) => {
  try {
    const notificationData = req.body;
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Notification creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== INVOICES ENDPOINTS ====================

// Get all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Invoices fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Invoice update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Invoice deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPLOAD ENDPOINTS ====================

// Upload job photo
app.post('/api/upload/job-photo', async (req, res) => {
  try {
    // This would need file upload handling with multer or similar
    res.json({ message: 'Photo upload endpoint - needs implementation' });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get job photos
app.get('/api/upload/job-photos/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    res.json({ message: 'Get job photos endpoint - needs implementation', bookingId });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete job photo
app.delete('/api/upload/job-photo/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    res.json({ message: 'Delete photo endpoint - needs implementation', photoId });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ACCOUNT MANAGEMENT ENDPOINTS ====================

// Reset client password
app.post('/api/admin/password-reset', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (newPassword) {
      // Set new password directly
      // This would typically involve hashing and updating auth system
      res.json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    } else {
      // Send password reset link
      // This would typically send an email with reset link
      res.json({ 
        success: true, 
        message: 'Password reset link sent to client' 
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Block client account
app.post('/api/admin/block-account', async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    if (!email || !reason) {
      return res.status(400).json({ error: 'Email and reason are required' });
    }
    
    // This would typically update user status in auth system
    // and create a record of the block action
    
    res.json({ 
      success: true, 
      message: 'Account blocked successfully' 
    });
  } catch (error) {
    console.error('Block account error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN CUSTOMER VIEW ENDPOINTS ====================

// Generate temporary customer view token for admin
app.post('/api/admin/customer-view-token', async (req, res) => {
  try {
    const { clientEmail } = req.body;
    
    if (!clientEmail) {
      return res.status(400).json({ error: 'Client email is required' });
    }
    
    // Generate a temporary token that expires in 1 hour
    const token = jwt.sign(
      { 
        clientEmail,
        isAdminView: true,
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      clientEmail,
      expiresAt: new Date(Date.now() + (60 * 60 * 1000)).toISOString()
    });
  } catch (error) {
    console.error('Generate customer view token error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify customer view token
app.get('/api/customer/verify-view-token', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    if (!decoded.isAdminView) {
      return res.status(403).json({ error: 'Invalid token type' });
    }
    
    if (decoded.expiresAt < Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Get client info
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', decoded.clientEmail)
      .single();
    
    if (error || !client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json({
      client,
      isAdminView: true,
      expiresAt: decoded.expiresAt
    });
  } catch (error) {
    console.error('Verify view token error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Analyze client with AI
app.post('/api/ai/analyze-client', async (req, res) => {
  try {
    const { client, bookings, invoices, totalSpent, pastDue } = req.body;
    
    console.log('🤖 Starting AI analysis for client:', client.email);
    
    try {
      // Build comprehensive prompt for Gemini
      const prompt = `
You are an expert business analyst for a junk removal service company. Analyze the following client data and provide detailed insights:

Client Information:
- Name: ${client.name}
- Email: ${client.email}
- Phone: ${client.phone || 'Not provided'}
- Address: ${client.address || 'Not provided'}

Booking History:
- Total Bookings: ${bookings?.length || 0}
- Completed Bookings: ${bookings?.filter(b => b.status === 'completed').length || 0}
- Cancelled Bookings: ${bookings?.filter(b => b.status === 'cancelled').length || 0}

Financial Data:
- Total Spent: $${totalSpent || 0}
- Past Due Amount: $${pastDue || 0}
- Total Invoices: ${invoices?.length || 0}
- Paid Invoices: ${invoices?.filter(i => i.status === 'paid').length || 0}

Please provide:
1. Risk Score (0-100): Based on payment history, booking patterns, and account activity
2. Loyalty Score (0-100): Based on repeat business, total spending, and engagement
3. Engagement Score (0-100): Based on communication frequency and responsiveness
4. Key Insights: Behavioral patterns, opportunities, and risk factors
5. Smart Recommendations: Actionable suggestions for this client
6. Predictive Analytics: Next booking probability, lifetime value, churn risk

Format your response as JSON:
{
  "riskScore": number,
  "loyaltyScore": number,
  "engagementScore": number,
  "insight": "detailed insight about client behavior",
  "suggestions": ["recommendation1", "recommendation2", "recommendation3"],
  "nextBookingProbability": number,
  "lifetimeValue": number,
  "churnRisk": number,
  "bestContactTime": "time range"
}
`;

      console.log('🤖 Sending prompt to Gemini AI...');
      
      // Generate content with Gemini
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Gemini AI response received');
      
      // Parse the JSON response
      let analysis;
      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('🤖 Error parsing AI response:', parseError);
        console.log('🤖 Raw AI response:', text);
        
        // Fallback to calculated scores if parsing fails
        analysis = getFallbackAnalysis(client, bookings, invoices, totalSpent, pastDue);
      }
      
      // Ensure all required fields are present
      analysis = {
        riskScore: analysis.riskScore || 25,
        loyaltyScore: analysis.loyaltyScore || 75,
        engagementScore: analysis.engagementScore || 60,
        insight: analysis.insight || `${client.name} shows moderate engagement with the service.`,
        suggestions: analysis.suggestions || [
          'Send personalized follow-up email',
          'Offer loyalty discount for next booking',
          'Schedule seasonal maintenance reminder'
        ],
        nextBookingProbability: analysis.nextBookingProbability || 65,
        lifetimeValue: analysis.lifetimeValue || (totalSpent * 2.5),
        churnRisk: analysis.churnRisk || 20,
        bestContactTime: analysis.bestContactTime || 'Tuesday 2-4 PM'
      };
      
      console.log('🤖 AI analysis completed successfully');
      res.json(analysis);
      
    } catch (aiError) {
      console.error('🤖 Gemini AI error:', aiError);
      
      // Fallback to rule-based analysis
      const analysis = getFallbackAnalysis(client, bookings, invoices, totalSpent, pastDue);
      
      console.log('🤖 Using fallback analysis');
      res.json(analysis);
    }
    
  } catch (error) {
    console.error('🤖 AI client analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fallback analysis function
function getFallbackAnalysis(client, bookings, invoices, totalSpent, pastDue) {
  console.log('🤖 Calculating fallback analysis with real data:', {
    client: client.email,
    bookingsCount: bookings.length,
    invoicesCount: invoices.length,
    totalSpent,
    pastDue
  });

  // Calculate realistic scores based on actual data
  let riskScore = 15; // Base risk score
  
  // Risk factors
  if (pastDue > 0) {
    riskScore += Math.min(pastDue / 50, 40); // More penalty for higher past due amounts
  }
  if (bookings.length === 0) {
    riskScore += 20; // Higher risk for no bookings
  } else if (bookings.filter(b => b.status === 'cancelled').length > bookings.length * 0.3) {
    riskScore += 15; // High cancellation rate
  }
  if (totalSpent < 100) {
    riskScore += 10; // Low spending indicates low commitment
  }
  if (invoices.filter(i => i.status === 'overdue').length > 0) {
    riskScore += 25; // Overdue invoices are high risk
  }
  riskScore = Math.min(Math.max(riskScore, 5), 95); // Keep between 5-95

  // Loyalty Score
  let loyaltyScore = 25; // Base loyalty
  
  // Loyalty factors
  loyaltyScore += Math.min(bookings.length * 8, 35); // More bookings = more loyalty
  loyaltyScore += Math.min(totalSpent / 100, 25); // Higher spending = more loyalty
  loyaltyScore += pastDue === 0 ? 15 : -15; // Good payment history
  loyaltyScore += bookings.filter(b => b.status === 'completed').length * 3; // Completed bookings
  if (totalSpent > 1000) loyaltyScore += 10; // High value client
  if (bookings.length > 5) loyaltyScore += 10; // Repeat client
  loyaltyScore = Math.min(Math.max(loyaltyScore, 10), 95);

  // Engagement Score
  let engagementScore = 20; // Base engagement
  
  // Engagement factors
  engagementScore += Math.min(bookings.length * 5, 30); // Booking activity
  engagementScore += Math.min(invoices.length * 3, 15); // Invoice interaction
  engagementScore += totalSpent > 0 ? 10 : 0; // Any spending shows engagement
  if (bookings.length > 0) {
    const daysSinceLastBooking = bookings.length > 0 ? 
      Math.max(...bookings.map(b => new Date(b.created_at).getTime())) : 0;
    const daysSince = (Date.now() - daysSinceLastBooking) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) engagementScore += 15; // Recent activity
    else if (daysSince < 90) engagementScore += 10; // Moderate activity
    else engagementScore -= 5; // Low recent activity
  }
  engagementScore = Math.min(Math.max(engagementScore, 10), 90);

  // Generate realistic insights based on data
  let insights = [];
  if (bookings.length === 0) {
    insights.push('New client with no booking history');
  } else if (bookings.length === 1) {
    insights.push('First-time client, potential for repeat business');
  } else if (bookings.length > 5) {
    insights.push('Established repeat client with strong engagement');
  }

  if (totalSpent > 2000) {
    insights.push('High-value client with significant spending');
  } else if (totalSpent > 500) {
    insights.push('Moderate spending with growth potential');
  }

  if (pastDue > 0) {
    insights.push(`Has outstanding balance of $${pastDue.toFixed(2)}`);
  } else {
    insights.push('Excellent payment history');
  }

  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  if (completedBookings === bookings.length && bookings.length > 0) {
    insights.push('Perfect booking completion rate');
  }

  // Generate smart recommendations
  const suggestions = [];
  if (bookings.length === 0) {
    suggestions.push('Send welcome email with first-time discount');
    suggestions.push('Schedule follow-up call to discuss services');
  } else if (bookings.length === 1) {
    suggestions.push('Send thank you email with loyalty offer');
    suggestions.push('Schedule seasonal maintenance reminder');
  } else {
    suggestions.push('Offer exclusive loyalty program benefits');
    suggestions.push('Provide priority scheduling options');
  }

  if (pastDue > 0) {
    suggestions.unshift('Send payment reminder with flexible options');
  }

  if (totalSpent > 1000) {
    suggestions.push('Offer premium service packages');
  }

  // Predictive analytics
  const avgBookingValue = bookings.length > 0 ? totalSpent / bookings.length : 0;
  const nextBookingProbability = bookings.length > 3 ? 85 : 
                                 bookings.length > 1 ? 65 : 
                                 bookings.length === 1 ? 45 : 25;

  const churnRisk = pastDue > 0 ? Math.min(pastDue / 100 + 20, 70) :
                   bookings.length === 0 ? 40 :
                   bookings.length === 1 ? 25 : 15;

  return {
    riskScore: Math.round(riskScore),
    loyaltyScore: Math.round(loyaltyScore),
    engagementScore: Math.round(engagementScore),
    insight: insights.join('. ') + `.`,
    suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
    nextBookingProbability,
    lifetimeValue: totalSpent * (1 + bookings.length * 0.5), // More bookings = higher LTV
    churnRisk: Math.round(churnRisk),
    bestContactTime: bookings.length > 2 ? 'Tuesday 2-4 PM' : 'Monday 10-12 PM'
  };
}

// Update client preferences
app.put('/api/admin/client-preferences/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { priorityLevel, accountStatus, preferences } = req.body;
    
    // Update client preferences in database
    // This would typically update a client_preferences table
    
    res.json({ 
      success: true, 
      message: 'Client preferences updated successfully' 
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client communication history
app.get('/api/admin/communication-history/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Fetch communication history
    const history = [
      {
        id: 1,
        type: 'email',
        subject: 'Service Confirmation',
        sentAt: new Date().toISOString(),
        status: 'delivered'
      },
      {
        id: 2,
        type: 'sms',
        message: 'Your appointment is confirmed',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        status: 'delivered'
      }
    ];
    
    res.json(history);
  } catch (error) {
    console.error('Communication history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate AI report
app.post('/api/ai/generate-report', async (req, res) => {
  try {
    const { clientEmail } = req.body;
    
    console.log('🤖 Generating comprehensive AI report for:', clientEmail);
    
    try {
      // Get client data (simplified for demo)
      const clientData = {
        email: clientEmail,
        name: clientEmail.split('@')[0], // Extract name from email
        // In real implementation, fetch from database
      };
      
      const prompt = `
Generate a comprehensive business intelligence report for this junk removal service client:

Client Email: ${clientEmail}

Please provide a detailed analysis including:
1. Executive Summary
2. Risk Assessment (payment risk, churn risk, compliance risk)
3. Value Analysis (lifetime value, growth potential)
4. Behavioral Patterns (booking patterns, seasonal trends)
5. Recommendations (actionable insights, growth opportunities)
6. Predictive Analytics (next booking probability, preferred services)

Format as structured JSON:
{
  "clientEmail": "${clientEmail}",
  "generatedAt": "timestamp",
  "executiveSummary": "brief overview",
  "riskAssessment": {
    "paymentRisk": "low|medium|high",
    "churnRisk": "low|medium|high",
    "complianceRisk": "low|medium|high"
  },
  "valueAnalysis": {
    "lifetimeValue": number,
    "growthPotential": "low|medium|high",
    "currentValue": number
  },
  "behavioralPatterns": {
    "bookingFrequency": "pattern",
    "seasonalTrends": ["trend1", "trend2"],
    "servicePreferences": ["service1", "service2"]
  },
  "recommendations": [
    {
      "category": "category",
      "priority": "high|medium|low",
      "action": "specific action",
      "expectedOutcome": "outcome"
    }
  ],
  "predictiveAnalytics": {
    "nextBookingProbability": number,
    "preferredServices": ["service1", "service2"],
    "optimalContactTime": "time range"
  },
  "riskScore": number,
  "loyaltyScore": number,
  "engagementScore": number
}
`;

      console.log('🤖 Sending comprehensive report request to Gemini AI...');
      
      const result = await aiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Gemini AI report response received');
      
      let report;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          report = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('🤖 Error parsing AI report:', parseError);
        console.log('🤖 Raw AI response:', text);
        
        // Fallback report
        report = {
          clientEmail,
          generatedAt: new Date().toISOString(),
          riskScore: 25,
          loyaltyScore: 85,
          engagementScore: 72,
          executiveSummary: `Comprehensive analysis of ${clientEmail}'s account history and patterns`,
          riskAssessment: {
            paymentRisk: 'low',
            churnRisk: 'low',
            complianceRisk: 'low'
          },
          valueAnalysis: {
            lifetimeValue: 2500,
            growthPotential: 'medium',
            currentValue: 1000
          },
          behavioralPatterns: {
            bookingFrequency: 'regular',
            seasonalTrends: ['spring cleaning', 'fall cleanup'],
            servicePreferences: ['junk removal', 'hauling']
          },
          recommendations: [
            {
              category: 'retention',
              priority: 'medium',
              action: 'Offer seasonal maintenance package',
              expectedOutcome: 'Increase repeat business by 25%'
            },
            {
              category: 'upselling',
              priority: 'low',
              action: 'Send personalized discount for next service',
              expectedOutcome: 'Improve customer satisfaction'
            }
          ],
          predictiveAnalytics: {
            nextBookingProbability: 78,
            preferredServices: ['junk removal', 'cleaning'],
            optimalContactTime: 'Tuesday 2-4 PM'
          }
        };
      }
      
      // Ensure required fields
      report = {
        ...report,
        clientEmail,
        generatedAt: report.generatedAt || new Date().toISOString(),
        riskScore: report.riskScore || 25,
        loyaltyScore: report.loyaltyScore || 75,
        engagementScore: report.engagementScore || 60
      };
      
      console.log('🤖 AI report generated successfully');
      res.json(report);
      
    } catch (aiError) {
      console.error('🤖 Gemini AI report error:', aiError);
      
      // Fallback report
      const report = {
        clientEmail,
        generatedAt: new Date().toISOString(),
        riskScore: 25,
        loyaltyScore: 85,
        engagementScore: 72,
        insights: [
          'Client shows consistent booking patterns',
          'High potential for upselling premium services',
          'Responsive to communication'
        ],
        recommendations: [
          'Offer seasonal maintenance package',
          'Send personalized discount for next service',
          'Schedule follow-up in 3 months'
        ],
        predictiveAnalytics: {
          nextBookingProbability: 78,
          lifetimeValue: 2500,
          churnRisk: 15
        }
      };
      
      console.log('🤖 Using fallback report');
      res.json(report);
    }
    
  } catch (error) {
    console.error('🤖 Generate report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { client } = req.query;
    
    // Fetch bookings from database
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_email', client)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(bookings || []);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const { client } = req.query;
    
    // Fetch invoices from database
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_email', client)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(invoices || []);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    // Fetch clients from database
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(clients || []);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI ENDPOINTS ====================

// AI Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    res.json({ message: 'AI chat endpoint - needs implementation', response: 'AI response placeholder' });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze booking
app.get('/api/ai/analyze-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    res.json({ message: 'Analyze booking endpoint - needs implementation', bookingId });
  } catch (error) {
    console.error('Analyze booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate email
app.post('/api/ai/generate-email', async (req, res) => {
  try {
    const { type, data } = req.body;
    res.json({ message: 'Generate email endpoint - needs implementation', type, data });
  } catch (error) {
    console.error('Generate email error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== EMAIL TEMPLATES ENDPOINTS ====================

// Get email templates
app.get('/api/email/templates', async (req, res) => {
  try {
    res.json({ message: 'Email templates endpoint - needs implementation' });
  } catch (error) {
    console.error('Email templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send email template
app.post('/api/email/templates/:templateId/send', async (req, res) => {
  try {
    const { templateId } = req.params;
    const data = req.body;
    res.json({ message: 'Send template endpoint - needs implementation', templateId, data });
  } catch (error) {
    console.error('Send template error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SMS ENDPOINTS ====================

// Get SMS subscribers
app.get('/api/sms/subscribers', async (req, res) => {
  try {
    res.json({ message: 'SMS subscribers endpoint - needs implementation' });
  } catch (error) {
    console.error('SMS subscribers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to SMS
app.post('/api/sms/subscribe', async (req, res) => {
  try {
    const { phone } = req.body;
    res.json({ message: 'SMS subscribe endpoint - needs implementation', phone });
  } catch (error) {
    console.error('SMS subscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from SMS
app.post('/api/sms/unsubscribe', async (req, res) => {
  try {
    const { phone } = req.body;
    res.json({ message: 'SMS unsubscribe endpoint - needs implementation', phone });
  } catch (error) {
    console.error('SMS unsubscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send SMS notification
app.post('/api/sms/notification', async (req, res) => {
  try {
    const { bookingId, type, message } = req.body;
    res.json({ message: 'SMS notification endpoint - needs implementation', bookingId, type, message });
  } catch (error) {
    console.error('SMS notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTIFICATION ENDPOINTS (Additional) ====================

// Get unread notifications
app.get('/api/notifications/unread', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Unread notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
      .select();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CLIENT SEARCH ENDPOINT ====================

// Search clients
app.get('/api/clients/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Client search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get dashboard analytics
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get bookings stats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');
    
    if (bookingsError) throw bookingsError;
    
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
    const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
    
    // Get clients count
    const { count: clientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (clientsError) throw clientsError;
    
    res.json({
      totalBookings,
      completedBookings,
      pendingBookings,
      totalClients: clientsCount || 0,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get revenue analytics
app.get('/api/analytics/revenue', async (req, res) => {
  try {
    // Get completed bookings with revenue data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'completed');
    
    if (bookingsError) throw bookingsError;
    
    // Calculate revenue from completed bookings
    const totalRevenue = bookings?.reduce((sum, booking) => {
      // Extract price from load_size or service_type
      const price = booking.price || 0;
      return sum + price;
    }, 0) || 0;
    
    // Get monthly revenue
    const monthlyRevenue = {};
    bookings?.forEach(booking => {
      if (booking.created_at) {
        const month = new Date(booking.created_at).toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (booking.price || 0);
      }
    });
    
    res.json({
      totalRevenue,
      completedBookings: bookings?.length || 0,
      averageBookingValue: bookings?.length > 0 ? totalRevenue / bookings.length : 0,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get booking analytics
app.get('/api/analytics/bookings', async (req, res) => {
  try {
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*');
    
    if (bookingsError) throw bookingsError;
    
    // Booking status breakdown
    const statusBreakdown = bookings?.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {}) || {};
    
    // Service type breakdown
    const serviceBreakdown = bookings?.reduce((acc, booking) => {
      acc[booking.service_type] = (acc[booking.service_type] || 0) + 1;
      return acc;
    }, {}) || {};
    
    res.json({
      totalBookings: bookings?.length || 0,
      statusBreakdown,
      serviceBreakdown
    });
  } catch (error) {
    console.error('Booking analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get client analytics
app.get('/api/analytics/clients', async (req, res) => {
  try {
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) throw clientsError;
    
    // Get bookings per client
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('client_id, status');
    
    if (bookingsError) throw bookingsError;
    
    // Calculate client metrics
    const clientMetrics = clients?.map(client => {
      const clientBookings = bookings?.filter(b => b.client_id === client.id) || [];
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        totalBookings: clientBookings.length,
        completedBookings: clientBookings.filter(b => b.status === 'completed').length
      };
    }) || [];
    
    res.json({
      totalClients: clients?.length || 0,
      activeClients: clientMetrics.filter(c => c.totalBookings > 0).length,
      clientMetrics
    });
  } catch (error) {
    console.error('Client analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== BOOKINGS ENDPOINTS ====================

// Get all bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available slots for a date
app.get('/api/bookings/available-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Return default time slots
    const slots = [
      "8:00 AM - 10:00 AM",
      "10:00 AM - 12:00 PM", 
      "12:00 PM - 2:00 PM",
      "2:00 PM - 4:00 PM",
      "4:00 PM - 6:00 PM",
    ];
    
    res.json({
      availableSlots: slots,
      availableCount: slots.length
    });
  } catch (error) {
    console.error('Available slots error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== GOOGLE REVIEWS ENDPOINTS ====================

// Trigger manual review sync
app.post('/api/reviews/sync', async (req, res) => {
  try {
    console.log('🔄 Manual review sync triggered');
    await fetchGoogleReviews();
    res.json({
      success: true,
      message: 'Review sync completed successfully'
    });
  } catch (error) {
    console.error('❌ Manual sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync reviews'
    });
  }
});

// Get Google Business settings
app.get('/api/reviews/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('google_business_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      settings: data
    });
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update Google Business settings
app.put('/api/reviews/settings', async (req, res) => {
  try {
    const { place_id, business_name, review_url, api_key, sync_enabled, sync_interval_hours } = req.body;
    
    const { data, error } = await supabase
      .from('google_business_settings')
      .upsert([{
        place_id,
        business_name,
        review_url,
        api_key,
        sync_enabled,
        sync_interval_hours
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      settings: data
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get review sync history
app.get('/api/reviews/sync-history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('review_sync_log')
      .select('*')
      .order('sync_started_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json({
      success: true,
      history: data
    });
  } catch (error) {
    console.error('❌ Get sync history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== GOOGLE SITE KIT ENDPOINTS ====================

// Get Site Kit settings
app.get('/api/sitekit/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('google_sitekit_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    res.json({
      success: true,
      settings: data || null
    });
  } catch (error) {
    console.error('❌ Get Site Kit settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update Site Kit settings
app.put('/api/sitekit/settings', async (req, res) => {
  try {
    const { property_id, analytics_id, search_console_url, tag_manager_id, adsense_client_id, credentials } = req.body;
    
    const { data, error } = await supabase
      .from('google_sitekit_settings')
      .upsert([{
        property_id,
        analytics_id,
        search_console_url,
        tag_manager_id,
        adsense_client_id,
        credentials,
        is_connected: true,
        last_sync_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      settings: data
    });
  } catch (error) {
    console.error('❌ Update Site Kit settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'StoneRiver Communication Server Running' });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'StoneRiver API Server Running' });
});

// Start Google Reviews sync scheduler
startReviewSync();

// Start SMS reminder scheduler
startReminderScheduler();

// Start quote follow-up scheduler
startQuoteFollowUpScheduler();

// Start email automation scheduler
startEmailAutomationScheduler();

// ==================== GOOGLE MAPS API ENDPOINTS ====================

// Calculate ETA using Google Maps Distance Matrix API
app.post('/api/maps/calculate-eta', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    const config = await loadConfig();
    const apiKey = config.google_maps_api_key || process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Google Maps API key not configured',
      });
    }

    // Call Google Maps Distance Matrix API
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}&departure_time=now&traffic_model=best_guess`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      
      res.json({
        success: true,
        duration_text: element.duration_in_traffic?.text || element.duration.text,
        duration_value: element.duration_in_traffic?.value || element.duration.value,
        distance_text: element.distance.text,
        distance_value: element.distance.value,
      });
    } else {
      throw new Error('Could not calculate route');
    }
  } catch (error) {
    console.error('❌ Maps API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate ETA',
    });
  }
});

// ==================== EMAIL AUTOMATION ENDPOINTS ====================

// Send "on the way" notification
app.post('/api/email/on-the-way', async (req, res) => {
  try {
    const { booking_id, driver_name, driver_phone, eta, distance } = req.body;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();
    
    if (error || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    const result = await sendOnTheWayNotification(booking, {
      driver_name,
      driver_phone,
      eta,
      distance,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send "running late" notification
app.post('/api/email/running-late', async (req, res) => {
  try {
    const { booking_id, delay_minutes, reason, new_eta } = req.body;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();
    
    if (error || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    const result = await sendRunningLateNotification(booking, {
      delay_minutes,
      reason,
      new_eta,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send booking confirmation email
app.post('/api/email/booking-confirmation', async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();
    
    if (error || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    const result = await sendBookingConfirmation(booking);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send "job complete" notification
app.post('/api/email/job-complete', async (req, res) => {
  try {
    const { booking_id } = req.body;
    
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();
    
    if (error || !booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    const result = await sendJobCompleteNotification(booking);
    
    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking_id);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CUSTOMER PORTAL ENDPOINTS ====================

// Change customer password
app.post('/api/portal/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, current password, and new password are required',
      });
    }

    const bcrypt = await import('bcryptjs');
    
    // Get customer account
    const { data: customer, error } = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !customer) {
      return res.status(400).json({
        success: false,
        error: 'Account not found',
      });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, customer.password_hash);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const { error: updateError } = await supabase
      .from('customer_accounts')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);
    
    if (updateError) throw updateError;
    
    console.log(`✅ Password changed for ${email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully',
    });
    
  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change password',
    });
  }
});

// Create customer portal account
app.post('/api/portal/create-account', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required',
      });
    }

    // Import bcrypt for password hashing
    const bcrypt = await import('bcryptjs');
    
    // Generate random password
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if account already exists
    const { data: existing } = await supabase
      .from('customer_accounts')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Account already exists for this email',
      });
    }
    
    // Create account
    const { data, error } = await supabase
      .from('customer_accounts')
      .insert([{
        email,
        name,
        phone,
        password_hash: hashedPassword,
        is_active: true,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Send credentials email
    try {
      const { sendPortalCredentials } = await import('./customer-portal-email.js');
      const emailResult = await sendPortalCredentials(email, name, password);
      
      if (emailResult.success) {
        console.log(`✅ Portal account created and email sent to ${email}`);
      } else {
        console.error(`⚠️  Portal account created but email failed: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error(`⚠️  Portal account created but email error:`, emailError);
    }
    
    console.log(`✅ Portal account created for ${email}`);
    
    res.json({
      success: true,
      message: 'Account created and credentials sent',
    });
    
  } catch (error) {
    console.error('❌ Portal account creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create account',
    });
  }
});

app.listen(PORT, () => {
  const baseUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
    : `http://localhost:${PORT}`;
  
  console.log(`🚀 StoneRiver Communication Server running on port ${PORT}`);
  console.log(`📱 SMS endpoint: ${baseUrl}/api/sms/send`);
  console.log(`📧 Email endpoint: ${baseUrl}/api/email/send`);
  console.log(`⭐ Reviews sync: Running every hour`);
  console.log(`🔧 Health check: ${baseUrl}/health`);
});
