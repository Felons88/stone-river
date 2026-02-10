// Automated Email Triggers for StoneRiver Junk Removal
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';

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

// Create email transporter with dynamic import
async function createTransporter() {
  const config = await getConfig();
  
  // Dynamic import like server.js does
  const nodemailer = await import('nodemailer');
  
  return nodemailer.default.createTransport({
    host: config.smtp_host || process.env.SMTP_HOST,
    port: parseInt(config.smtp_port || process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: config.smtp_user || process.env.SMTP_USER,
      pass: config.smtp_password || process.env.SMTP_PASSWORD,
    },
  });
}

// ==================== AUTO-SEND BOOKING CONFIRMATION ====================
export async function sendBookingConfirmation(booking) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.name},</p>
            <p>Great news! Your booking has been confirmed.</p>
            <div class="info-box">
              <strong>Service:</strong> ${booking.service_type}<br>
              <strong>Date:</strong> ${booking.preferred_date}<br>
              <strong>Time:</strong> ${booking.preferred_time || 'TBD'}<br>
              <strong>Address:</strong> ${booking.service_address}
            </div>
            <p>We'll send you a reminder 24 hours before your appointment.</p>
            <p>Questions? Call us at <strong>${config.business_phone || '(612) 685-4696'}</strong></p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 12px;">StoneRiver Junk Removal</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: booking.email,
      subject: '✅ Booking Confirmed - StoneRiver Junk Removal',
      html,
    });

    console.log(`✅ Booking confirmation sent to ${booking.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error);
    return { success: false, error: error.message };
  }
}

// ==================== 24 HOUR REMINDER ====================
async function send24HourReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('preferred_date', tomorrowStr)
      .eq('status', 'confirmed')
      .is('reminder_sent', null);

    if (error) throw error;

    const config = await getConfig();
    const transporter = await createTransporter();

    for (const booking of bookings || []) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fef3c7; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⏰ Reminder: Service Tomorrow</h1>
            </div>
            <div class="content">
              <p>Hi ${booking.name},</p>
              <p>This is a friendly reminder about your service tomorrow!</p>
              <div class="info-box">
                <strong>Service:</strong> ${booking.service_type}<br>
                <strong>Date:</strong> ${booking.preferred_date}<br>
                <strong>Time:</strong> ${booking.preferred_time || 'TBD'}
              </div>
              <p>Please ensure the area is accessible and items are ready for removal.</p>
              <p>See you tomorrow!</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
        to: booking.email,
        subject: '⏰ Reminder: Service Tomorrow - StoneRiver',
        html,
      });

      // Mark reminder as sent
      await supabase
        .from('bookings')
        .update({ reminder_sent: true })
        .eq('id', booking.id);

      console.log(`✅ 24h reminder sent to ${booking.email}`);
    }
  } catch (error) {
    console.error('❌ Error sending 24h reminders:', error);
  }
}

// ==================== 30 MINUTE "ON THE WAY" NOTIFICATION ====================
export async function sendOnTheWayNotification(booking, driverInfo) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #d1fae5; padding: 20px; border-radius: 8px; border: 2px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🚛 We're On Our Way!</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.name},</p>
            <p>Good news! Our team has left and is on the way to your location.</p>
            <div class="info-box">
              <strong>Estimated Arrival:</strong> ${driverInfo?.eta || driverInfo?.duration_text || '30 minutes'}<br>
              <strong>Distance:</strong> ${driverInfo?.distance || driverInfo?.distance_text || 'Calculating...'}<br>
              <strong>Team Lead:</strong> ${driverInfo?.driver_name || 'Your StoneRiver Team'}<br>
              <strong>Contact:</strong> ${driverInfo?.driver_phone || config.business_phone || '(612) 685-4696'}
            </div>
            <p>See you soon!</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">📍 Live tracking enabled - we'll keep you updated!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: booking.email,
      subject: '🚛 We\'re On Our Way! - StoneRiver',
      html,
    });

    console.log(`✅ "On the way" notification sent to ${booking.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending on the way notification:', error);
    return { success: false, error: error.message };
  }
}

// ==================== RUNNING LATE NOTIFICATION ====================
export async function sendRunningLateNotification(booking, delayInfo) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fef3c7; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏱️ Quick Update</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.name},</p>
            <p>We wanted to let you know that we're running about ${delayInfo.delay_minutes || '15'} minutes behind schedule due to ${delayInfo.reason || 'our previous job taking longer than expected'}.</p>
            <div class="info-box">
              <strong>New ETA:</strong> ${delayInfo.new_eta}<br>
              <strong>Original Time:</strong> ${booking.preferred_time}
            </div>
            <p>We apologize for the inconvenience and appreciate your patience!</p>
            <p>Questions? Call us at <strong>${config.business_phone || '(612) 685-4696'}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: booking.email,
      subject: '⏱️ Running a Few Minutes Late - StoneRiver',
      html,
    });

    console.log(`✅ Running late notification sent to ${booking.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending running late notification:', error);
    return { success: false, error: error.message };
  }
}

// ==================== JOB COMPLETE NOTIFICATION ====================
export async function sendJobCompleteNotification(booking) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
          .info-box { background: #e0f2fe; padding: 20px; border-radius: 8px; border: 2px solid #0ea5e9; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✨ Service Complete!</h1>
          </div>
          <div class="content">
            <p>Hi ${booking.name},</p>
            <p>Thank you for choosing StoneRiver Junk Removal! Your service has been completed successfully.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0;">📄 Invoice Information</h3>
              <p>Your invoice will be sent to your email within <strong>24 hours</strong>. Please keep an eye out for it!</p>
            </div>
            
            <p>We'd love to hear about your experience! Your feedback helps us improve our service.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://stoneriverjunk.com/reviews" class="button">⭐ Leave a Review</a>
              <a href="https://stoneriverjunk.com/contact" class="button">📞 Contact Us</a>
            </div>
            
            <p>Need us again? You get <strong>10% off</strong> your next service as a returning customer!</p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Thank you for your business! 🙏<br>
              - The StoneRiver Team
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: booking.email,
      subject: '✨ Service Complete - Thank You! - StoneRiver',
      html,
    });

    console.log(`✅ Job complete notification sent to ${booking.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending job complete notification:', error);
    return { success: false, error: error.message };
  }
}

// ==================== SCHEDULER ====================
export function startEmailAutomationScheduler() {
  // Run 24-hour reminders every day at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('🔄 Running 24-hour reminder check...');
    send24HourReminders();
  });

  console.log('📧 Email automation scheduler started');
}

export default {
  sendBookingConfirmation,
  sendOnTheWayNotification,
  sendRunningLateNotification,
  sendJobCompleteNotification,
  startEmailAutomationScheduler,
};
