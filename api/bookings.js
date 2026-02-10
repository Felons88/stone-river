// Vercel serverless function for bookings
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Handle different booking endpoints
    if (url.includes('/available-slots') && method === 'GET') {
      const { date } = req.query;
      
      // Return default time slots for now
      const slots = [
        "8:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM", 
        "12:00 PM - 2:00 PM",
        "2:00 PM - 4:00 PM",
        "4:00 PM - 6:00 PM",
      ];
      
      return res.status(200).json({
        availableSlots: slots,
        availableCount: slots.length
      });
    }
    
    if (method === 'POST') {
      // Create new booking
      const bookingData = req.body;
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
      
      if (error) throw error;
      
      return res.status(201).json(data[0]);
    }
    
    if (method === 'GET') {
      // Get all bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (error) throw error;
      
      return res.status(200).json(data);
    }
    
  } catch (error) {
    console.error('Booking API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
