import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';

dotenv.config({ path: '.env.server' });

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://fzzhzhtyywjgopphvflr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Google Places API - Fetch Reviews
async function fetchGoogleReviews() {
  let syncLog = null;
  
  try {
    console.log('🔄 Starting Google Reviews sync...');
    
    // Create sync log entry
    const { data: logData, error: syncLogError } = await supabase
      .from('review_sync_log')
      .insert([{ status: 'running' }])
      .select()
      .single();
    
    if (syncLogError) throw syncLogError;
    syncLog = logData;
    
    // Get Google Business settings
    const { data: settings, error: settingsError } = await supabase
      .from('google_business_settings')
      .select('*')
      .single();
    
    if (settingsError || !settings) {
      throw new Error('Google Business settings not configured');
    }
    
    if (!settings.sync_enabled) {
      console.log('⏸️  Sync is disabled in settings');
      await supabase
        .from('review_sync_log')
        .update({ 
          status: 'skipped',
          sync_completed_at: new Date().toISOString(),
          error_message: 'Sync disabled in settings'
        })
        .eq('id', syncLog.id);
      return;
    }
    
    // Get API key from business_config
    const { data: configData } = await supabase
      .from('business_config')
      .select('config_value')
      .eq('config_key', 'google_places_api_key')
      .single();
    
    const apiKey = configData?.config_value || settings.api_key || process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.log('⚠️  Google Places API key not configured. Add it in Admin → Settings → API Keys');
      await supabase
        .from('review_sync_log')
        .update({ 
          status: 'skipped',
          sync_completed_at: new Date().toISOString(),
          error_message: 'API key not configured'
        })
        .eq('id', syncLog.id);
      return;
    }
    
    const placeId = settings.place_id;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
    
    const reviews = data.result?.reviews || [];
    console.log(`📊 Found ${reviews.length} reviews from Google`);
    
    let reviewsAdded = 0;
    let reviewsUpdated = 0;
    
    // Process each review
    for (const review of reviews) {
      const googleReviewId = `google_${review.time}_${review.author_name.replace(/\s+/g, '_')}`;
      
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('google_reviews')
        .select('id')
        .eq('google_review_id', googleReviewId)
        .single();
      
      const reviewData = {
        google_review_id: googleReviewId,
        author_name: review.author_name,
        author_photo_url: review.profile_photo_url,
        rating: review.rating,
        review_text: review.text || '',
        review_date: new Date(review.time * 1000).toISOString(),
        source: 'google',
        status: 'published',
        synced_from_google: true
      };
      
      if (existingReview) {
        // Update existing review
        await supabase
          .from('google_reviews')
          .update(reviewData)
          .eq('id', existingReview.id);
        reviewsUpdated++;
      } else {
        // Insert new review
        await supabase
          .from('google_reviews')
          .insert([reviewData]);
        reviewsAdded++;
      }
    }
    
    // Update sync log
    await supabase
      .from('review_sync_log')
      .update({
        status: 'completed',
        sync_completed_at: new Date().toISOString(),
        reviews_fetched: reviews.length,
        reviews_added: reviewsAdded,
        reviews_updated: reviewsUpdated
      })
      .eq('id', syncLog.id);
    
    // Update last sync time in settings
    await supabase
      .from('google_business_settings')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', settings.id);
    
    console.log(`✅ Sync completed: ${reviewsAdded} added, ${reviewsUpdated} updated`);
    
  } catch (error) {
    console.error('❌ Google Reviews sync error:', error);
    
    // Log error in sync log
    if (syncLog?.id) {
      await supabase
        .from('review_sync_log')
        .update({
          status: 'failed',
          sync_completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', syncLog.id);
    }
  }
}

// Schedule sync to run every hour
export function startReviewSync() {
  console.log('🚀 Google Reviews sync scheduler started');
  
  // Run immediately on startup
  fetchGoogleReviews();
  
  // Then run every hour
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled Google Reviews sync');
    fetchGoogleReviews();
  });
}

// Export for manual trigger
export { fetchGoogleReviews };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startReviewSync();
}
