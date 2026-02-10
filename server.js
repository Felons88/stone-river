import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import twilio from 'twilio';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { startReviewSync, fetchGoogleReviews } from './google-reviews-sync.js';
import { sendInvoiceEmail } from './email-automation.js';
import { startReminderScheduler } from './sms-reminders.js';
import { startQuoteFollowUpScheduler } from './quote-follow-up.js';
import { startEmailAutomationScheduler, sendBookingConfirmation, sendOnTheWayNotification, sendRunningLateNotification, sendJobCompleteNotification } from './email-automation-triggers.js';

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
      return_url: 'http://localhost:8080/invoice/' + invoice_id
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
  console.log(`🚀 StoneRiver Communication Server running on port ${PORT}`);
  console.log(`📱 SMS endpoint: http://localhost:${PORT}/api/sms/send`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/email/send`);
  console.log(`⭐ Reviews sync: Running every hour`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});
