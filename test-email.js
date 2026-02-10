// Test script to verify email endpoint is working
// Run with: node test-email.js

const testBookingId = 'YOUR_BOOKING_ID_HERE'; // Replace with actual booking ID

async function testEmail() {
  console.log('🧪 Testing booking confirmation email...');
  console.log('📧 Booking ID:', testBookingId);
  
  try {
    const response = await fetch('http://localhost:3001/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: testBookingId }),
    });
    
    console.log('📊 Response status:', response.status);
    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Is the server running? Start it with: node server.js');
  }
}

testEmail();
