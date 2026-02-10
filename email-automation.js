// Automated Email System for Bookings and Invoices
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.server' });

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Load config from database
async function getConfig() {
  const { data, error } = await supabase
    .from('business_config')
    .select('config_key, config_value');
  
  if (error) throw error;
  
  return data.reduce((acc, item) => {
    acc[item.config_key] = item.config_value;
    return acc;
  }, {});
}

// Create email transporter
async function createTransporter() {
  const config = await getConfig();
  
  return nodemailer.createTransport({
    host: config.smtp_host || process.env.SMTP_HOST,
    port: parseInt(config.smtp_port || process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: config.smtp_user || process.env.SMTP_USER,
      pass: config.smtp_password || process.env.SMTP_PASSWORD,
    },
  });
}

// Load email template
function loadTemplate(templateName) {
  const templatePath = path.join(__dirname, 'email-templates', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
}

// Replace template variables
function replaceVariables(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

// Send Booking Confirmation Email
export async function sendBookingConfirmation(bookingId) {
  try {
    console.log(`📧 Sending booking confirmation for ${bookingId}...`);
    
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (bookingError) throw bookingError;
    if (!booking) throw new Error('Booking not found');
    
    const config = await getConfig();
    const transporter = await createTransporter();
    
    // Load and populate template
    let template = loadTemplate('booking-confirmation');
    template = replaceVariables(template, {
      customer_name: booking.customer_name,
      booking_id: booking.id,
      service_type: booking.service_type,
      preferred_date: new Date(booking.preferred_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      preferred_time: booking.preferred_time || 'To be confirmed',
      service_address: booking.service_address,
      estimated_load: booking.estimated_load,
      special_instructions: booking.special_instructions || 'None',
      business_name: config.business_name || 'StoneRiver Junk Removal',
      business_phone: config.business_phone || '(612) 685-4696',
      business_email: config.business_email || 'noreply@stoneriverjunk.com',
    });
    
    // Send email
    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: booking.email,
      subject: `Booking Confirmation - ${booking.service_type}`,
      html: template,
    });
    
    console.log(`✅ Booking confirmation sent to ${booking.email}`);
    
    // Create notification
    await supabase.from('notifications').insert([{
      type: 'booking_confirmed',
      title: 'Booking Confirmation Sent',
      message: `Confirmation email sent to ${booking.customer_name}`,
      related_id: bookingId,
    }]);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    return { success: false, error: error.message };
  }
}

// Send Invoice Email
export async function sendInvoiceEmail(invoiceId) {
  try {
    console.log(`📧 Sending invoice email for ${invoiceId}...`);
    
    // Get invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    
    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');
    
    const config = await getConfig();
    const transporter = await createTransporter();
    
    // Create invoice email HTML
    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${config.business_name || 'StoneRiver Junk Removal'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Invoice</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Payment Request</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
        Hello <strong>${invoice.customer_name}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">
        Thank you for choosing ${config.business_name || 'StoneRiver Junk Removal'}! Your invoice is ready for payment.
      </p>
      
      <!-- Invoice Details -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 20px 0; font-weight: bold;">Invoice Details</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${invoice.invoice_number}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Issue Date:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${new Date(invoice.created_at).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Service:</td>
            <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-align: right;">${invoice.service_type}</td>
          </tr>
          <tr style="border-top: 2px solid #e5e7eb;">
            <td style="padding: 15px 0 0 0; color: #1f2937; font-size: 18px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 15px 0 0 0; color: #2563eb; font-size: 24px; font-weight: bold; text-align: right;">$${parseFloat(invoice.total_amount).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <!-- Payment Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/invoice/${invoice.id}" 
           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
          Pay Invoice Now
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 20px 0 0 0;">
        Or copy this link: ${process.env.FRONTEND_URL || 'http://localhost:8080'}/invoice/${invoice.id}
      </p>
      
      <!-- Notes -->
      ${invoice.notes ? `
      <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: bold;">Notes:</p>
        <p style="margin: 10px 0 0 0; color: #78350f; font-size: 14px; line-height: 1.5;">${invoice.notes}</p>
      </div>
      ` : ''}
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: bold; font-size: 16px;">
        ${config.business_name || 'StoneRiver Junk Removal'}
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${config.business_phone || '(612) 685-4696'} • ${config.business_email || 'noreply@stoneriverjunk.com'}
      </p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
        ${config.business_address || 'St. Cloud, MN'}
      </p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Send email
    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} - ${config.business_name || 'StoneRiver Junk Removal'}`,
      html: invoiceHtml,
    });
    
    console.log(`✅ Invoice email sent to ${invoice.customer_email}`);
    
    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'sent' })
      .eq('id', invoiceId);
    
    // Create notification
    await supabase.from('notifications').insert([{
      type: 'invoice_sent',
      title: 'Invoice Sent',
      message: `Invoice ${invoice.invoice_number} sent to ${invoice.customer_name}`,
      related_id: invoiceId,
    }]);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendBookingConfirmation,
  sendInvoiceEmail,
};
