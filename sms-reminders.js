// SMS Reminder System - 24 hours before booking
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import dotenv from 'dotenv';
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

// Send SMS reminder
async function sendBookingReminder(booking) {
  try {
    const config = await getConfig();
    
    const accountSid = config.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = config.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = config.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER;
    
    if (!accountSid || !authToken || !fromNumber) {
      console.log('⚠️  Twilio not configured, skipping SMS reminder');
      return { success: false, error: 'Twilio not configured' };
    }
    
    const client = twilio(accountSid, authToken);
    
    const message = `Hi ${booking.customer_name}! This is a reminder about your ${booking.service_type} appointment tomorrow at ${booking.preferred_time || 'TBD'}. Address: ${booking.service_address}. Questions? Call ${config.business_phone || '(612) 685-4696'}. - ${config.business_name || 'StoneRiver Junk Removal'}`;
    
    await client.messages.create({
      body: message,
      from: fromNumber,
      to: booking.phone,
    });
    
    console.log(`✅ SMS reminder sent to ${booking.phone}`);
    
    // Mark reminder as sent
    await supabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id);
    
    // Create notification
    await supabase.from('notifications').insert([{
      type: 'reminder_sent',
      title: 'Booking Reminder Sent',
      message: `SMS reminder sent to ${booking.customer_name}`,
      related_id: booking.id,
    }]);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending SMS reminder:', error);
    return { success: false, error: error.message };
  }
}

// Check for bookings 24 hours from now
async function checkUpcomingBookings() {
  try {
    console.log('🔍 Checking for bookings needing reminders...');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Find bookings for tomorrow that haven't received reminders
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('preferred_date', tomorrowStr)
      .eq('status', 'confirmed')
      .or('reminder_sent.is.null,reminder_sent.eq.false');
    
    if (error) throw error;
    
    if (!bookings || bookings.length === 0) {
      console.log('✅ No bookings need reminders');
      return;
    }
    
    console.log(`📱 Found ${bookings.length} booking(s) needing reminders`);
    
    for (const booking of bookings) {
      if (booking.phone) {
        await sendBookingReminder(booking);
      } else {
        console.log(`⏭️  Skipping ${booking.customer_name} - no phone number`);
      }
    }
    
    console.log('✅ Reminder check complete');
  } catch (error) {
    console.error('❌ Error checking upcoming bookings:', error);
  }
}

// Start reminder scheduler
export function startReminderScheduler() {
  console.log('📅 Starting booking reminder scheduler...');
  
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running daily reminder check...');
    checkUpcomingBookings();
  });
  
  console.log('✅ Reminder scheduler started (runs daily at 9 AM)');
}

// Manual trigger for testing
export async function triggerRemindersNow() {
  console.log('🔄 Manually triggering reminder check...');
  await checkUpcomingBookings();
}

export default {
  startReminderScheduler,
  triggerRemindersNow,
  sendBookingReminder,
};
