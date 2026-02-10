// Google Voice SMS Service
// This service handles real Google Voice SMS sending using the backend API

export const sendGoogleVoiceSMS = async ({ to, message }: { to: string; message: string }) => {
  try {
    console.log('📱 Google Voice SMS Service - Sending to:', to);
    console.log('📱 Message:', message);

    // Send SMS via backend API
    const response = await fetch('http://localhost:3001/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: to,
        message: message
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Google Voice SMS sent successfully:', result);
    
    return {
      success: result.success,
      message: result.message,
      to: to,
      timestamp: result.timestamp || new Date().toISOString(),
      note: 'SMS sent via Google Voice backend'
    };

  } catch (error) {
    console.error('📱 Google Voice SMS error:', error);
    throw new Error(`Failed to send SMS: ${error.message}. Make sure server is running: node server.js`);
  }
};

export default sendGoogleVoiceSMS;
