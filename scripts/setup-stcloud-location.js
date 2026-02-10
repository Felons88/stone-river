// Setup St. Cloud, MN as business location for privacy
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.server' });

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

async function setupStCloudLocation() {
  console.log('🏢 Setting up St. Cloud, MN as business location...\n');

  const configs = [
    // Business Information (Public-facing)
    { config_key: 'business_name', config_value: 'StoneRiver Junk Removal' },
    { config_key: 'business_phone', config_value: '(612) 685-4696' },
    { config_key: 'business_email', config_value: 'noreply@stoneriverjunk.com' },
    { config_key: 'business_address', config_value: 'St. Cloud, MN 56301' }, // General area, not specific address
    { config_key: 'business_city', config_value: 'St. Cloud' },
    { config_key: 'business_state', config_value: 'MN' },
    { config_key: 'business_zip', config_value: '56301' },
    
    // Service Area (ZIP codes you serve)
    { 
      config_key: 'service_area_zipcodes', 
      config_value: JSON.stringify([
        '56301', '56303', '56304', // St. Cloud
        '56302', // Waite Park
        '56377', // Sartell
        '56387', // Sauk Rapids
        '56379', // St. Joseph
        '56374', // St. Augusta
        '56395', // Waite Park
      ])
    },
    
    // Business Hours
    { 
      config_key: 'business_hours', 
      config_value: JSON.stringify({
        monday: '8:00 AM - 6:00 PM',
        tuesday: '8:00 AM - 6:00 PM',
        wednesday: '8:00 AM - 6:00 PM',
        thursday: '8:00 AM - 6:00 PM',
        friday: '8:00 AM - 6:00 PM',
        saturday: '9:00 AM - 4:00 PM',
        sunday: 'Closed'
      })
    },
    
    // Business Description
    { 
      config_key: 'business_description', 
      config_value: 'Professional junk removal and hauling services serving St. Cloud, MN and surrounding areas. Fast, affordable, and eco-friendly disposal solutions.'
    },
    
    // Service Radius (miles)
    { config_key: 'service_radius_miles', config_value: '25' },
    
    // Privacy Settings
    { config_key: 'show_exact_address', config_value: 'false' },
    { config_key: 'is_service_area_business', config_value: 'true' },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const config of configs) {
    try {
      const { error } = await supabase
        .from('business_config')
        .upsert([config], { onConflict: 'config_key' });

      if (error) throw error;

      console.log(`✅ ${config.config_key}: ${config.config_value.substring(0, 50)}${config.config_value.length > 50 ? '...' : ''}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to set ${config.config_key}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Setup complete: ${successCount} successful, ${errorCount} failed\n`);
  
  console.log('✅ Business location set to St. Cloud, MN (general area)');
  console.log('✅ Service area configured for St. Cloud and surrounding cities');
  console.log('✅ Privacy protected - no exact address shown');
  console.log('\n📝 Next steps:');
  console.log('1. Go to Admin Panel → Settings → Business Info to verify');
  console.log('2. When ready for Google Business Profile, use a PO Box or virtual office');
  console.log('3. For now, customers will only see "St. Cloud, MN" as your location\n');
}

setupStCloudLocation().catch(console.error);
