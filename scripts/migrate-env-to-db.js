// Script to migrate existing .env.server values to business_config table
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.server' });

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

async function migrateEnvToDatabase() {
  console.log('🔄 Migrating environment variables to database...\n');

  const configs = [
    // Stripe
    { config_key: 'stripe_secret_key', config_value: process.env.STRIPE_SECRET_KEY || '' },
    { config_key: 'stripe_publishable_key', config_value: process.env.STRIPE_PUBLISHABLE_KEY || '' },
    
    // PayPal
    { config_key: 'paypal_client_id', config_value: process.env.PAYPAL_CLIENT_ID || '' },
    { config_key: 'paypal_client_secret', config_value: process.env.PAYPAL_CLIENT_SECRET || '' },
    
    // Twilio
    { config_key: 'twilio_account_sid', config_value: process.env.TWILIO_ACCOUNT_SID || '' },
    { config_key: 'twilio_auth_token', config_value: process.env.TWILIO_AUTH_TOKEN || '' },
    { config_key: 'twilio_phone_number', config_value: process.env.TWILIO_PHONE_NUMBER || '' },
    
    // SMTP
    { config_key: 'smtp_host', config_value: process.env.SMTP_HOST || '' },
    { config_key: 'smtp_port', config_value: process.env.SMTP_PORT || '' },
    { config_key: 'smtp_user', config_value: process.env.SMTP_USER || '' },
    { config_key: 'smtp_password', config_value: process.env.SMTP_PASSWORD || '' },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const config of configs) {
    if (!config.config_value) {
      console.log(`⏭️  Skipping ${config.config_key} (not set in .env.server)`);
      continue;
    }

    try {
      // Check if key exists first
      const { data: existing } = await supabase
        .from('business_config')
        .select('config_key, config_value')
        .eq('config_key', config.config_key)
        .single();

      if (existing && existing.config_value) {
        console.log(`⏭️  ${config.config_key} already exists in database (skipping)`);
        continue;
      }

      const { error } = await supabase
        .from('business_config')
        .upsert([config], { onConflict: 'config_key' });

      if (error) throw error;

      const maskedValue = config.config_value.length > 20 
        ? config.config_value.substring(0, 10) + '...' + config.config_value.substring(config.config_value.length - 4)
        : '***';
      
      console.log(`✅ ${config.config_key}: ${maskedValue}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${config.config_key}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Migration complete: ${successCount} successful, ${errorCount} failed`);
  console.log('✅ You can now view and edit these in Admin Panel → Settings → API Keys\n');
}

migrateEnvToDatabase().catch(console.error);
