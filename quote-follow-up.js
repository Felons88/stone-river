// Quote Follow-Up Automation System
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
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

// Email templates for different follow-up stages
const emailTemplates = {
  day1: {
    subject: 'Thanks for Your Quote Request!',
    html: (quote) => `
      <h2>Hi ${quote.customer_name}!</h2>
      <p>Thank you for requesting a quote from StoneRiver Junk Removal.</p>
      <p><strong>Your Estimated Price: $${quote.estimated_price}</strong></p>
      <p>We're ready to help you reclaim your space! Click below to book your service:</p>
      <a href="https://stoneriverjunk.com/booking?quote=${quote.id}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Now</a>
      <p>Questions? Call us at (612) 685-4696</p>
    `,
  },
  day3: {
    subject: 'Still Need Help with Junk Removal?',
    html: (quote) => `
      <h2>Hi ${quote.customer_name},</h2>
      <p>We noticed you haven't booked your junk removal service yet. We're here to help!</p>
      <p><strong>Your Quote: $${quote.estimated_price}</strong></p>
      <blockquote style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 20px 0;">
        <p><em>"StoneRiver was amazing! Fast, professional, and affordable. Highly recommend!"</em></p>
        <p>- Sarah M., St. Cloud</p>
      </blockquote>
      <a href="https://stoneriverjunk.com/booking?quote=${quote.id}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Your Service</a>
    `,
  },
  day7: {
    subject: '🎁 Special Offer: 10% Off Your Junk Removal',
    html: (quote) => `
      <h2>Hi ${quote.customer_name},</h2>
      <p><strong>Limited Time Offer: Save 10% on your junk removal!</strong></p>
      <p>Original Quote: <s>$${quote.estimated_price}</s></p>
      <p style="font-size: 24px; color: #2563eb; font-weight: bold;">Your Price: $${(quote.estimated_price * 0.9).toFixed(2)}</p>
      <p>This offer expires in 7 days. Don't miss out!</p>
      <a href="https://stoneriverjunk.com/booking?quote=${quote.id}&discount=10" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Claim Your Discount</a>
    `,
  },
  day14: {
    subject: 'Last Chance: Your Quote is About to Expire',
    html: (quote) => `
      <h2>Hi ${quote.customer_name},</h2>
      <p>This is our final reminder about your junk removal quote.</p>
      <p>Your quote of <strong>$${quote.estimated_price}</strong> will expire soon.</p>
      <p>If you're still interested, we'd love to help you. If not, no worries - we'll remove you from our follow-up list.</p>
      <a href="https://stoneriverjunk.com/booking?quote=${quote.id}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Now</a>
      <p style="font-size: 12px; color: #666;">Not interested? <a href="https://stoneriverjunk.com/unsubscribe?quote=${quote.id}">Click here</a></p>
    `,
  },
};

// Send follow-up email
async function sendFollowUpEmail(quote, stage) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();
    const template = emailTemplates[stage];

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: quote.email,
      subject: template.subject,
      html: template.html(quote),
    });

    console.log(`✅ Sent ${stage} follow-up to ${quote.email}`);

    // Update quote follow-up count
    await supabase
      .from('quote_requests')
      .update({
        follow_up_count: (quote.follow_up_count || 0) + 1,
        last_follow_up_at: new Date().toISOString(),
      })
      .eq('id', quote.id);

    return { success: true };
  } catch (error) {
    console.error(`❌ Error sending ${stage} follow-up:`, error);
    return { success: false, error: error.message };
  }
}

// Check for quotes needing follow-up
async function checkQuoteFollowUps() {
  try {
    console.log('🔍 Checking for quotes needing follow-up...');

    const now = new Date();
    const day1Ago = new Date(now - 1 * 24 * 60 * 60 * 1000);
    const day3Ago = new Date(now - 3 * 24 * 60 * 60 * 1000);
    const day7Ago = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const day14Ago = new Date(now - 14 * 24 * 60 * 60 * 1000);

    // Get pending quotes
    const { data: quotes, error } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', now.toISOString());

    if (error) throw error;

    if (!quotes || quotes.length === 0) {
      console.log('✅ No quotes need follow-up');
      return;
    }

    for (const quote of quotes) {
      const createdAt = new Date(quote.created_at);
      const daysSinceCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      const followUpCount = quote.follow_up_count || 0;

      // Day 1 follow-up
      if (daysSinceCreated >= 1 && followUpCount === 0) {
        await sendFollowUpEmail(quote, 'day1');
      }
      // Day 3 follow-up
      else if (daysSinceCreated >= 3 && followUpCount === 1) {
        await sendFollowUpEmail(quote, 'day3');
      }
      // Day 7 follow-up (with discount)
      else if (daysSinceCreated >= 7 && followUpCount === 2) {
        await sendFollowUpEmail(quote, 'day7');
      }
      // Day 14 final follow-up
      else if (daysSinceCreated >= 14 && followUpCount === 3) {
        await sendFollowUpEmail(quote, 'day14');
        
        // Mark quote as expired after final follow-up
        await supabase
          .from('quote_requests')
          .update({ status: 'expired' })
          .eq('id', quote.id);
      }
    }

    console.log('✅ Quote follow-up check complete');
  } catch (error) {
    console.error('❌ Error checking quote follow-ups:', error);
  }
}

// Start follow-up scheduler
export function startQuoteFollowUpScheduler() {
  console.log('📧 Starting quote follow-up scheduler...');
  
  // Run every day at 10 AM
  cron.schedule('0 10 * * *', () => {
    console.log('⏰ Running daily quote follow-up check...');
    checkQuoteFollowUps();
  });
  
  console.log('✅ Quote follow-up scheduler started (runs daily at 10 AM)');
}

// Manual trigger for testing
export async function triggerQuoteFollowUpsNow() {
  console.log('🔄 Manually triggering quote follow-ups...');
  await checkQuoteFollowUps();
}

export default {
  startQuoteFollowUpScheduler,
  triggerQuoteFollowUpsNow,
  checkQuoteFollowUps,
};
