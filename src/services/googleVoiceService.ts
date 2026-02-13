// Google Voice SMS Service
// This service handles real Google Voice SMS sending using the backend API

import { apiFetch } from '@/lib/config';

export const sendGoogleVoiceSMS = async ({ to, message }: { to: string; message: string }) => {
  try {
    console.log('📱 Google Voice SMS Service - Sending to:', to);
    console.log('📱 Message:', message);

    // Send SMS via backend API
    const response = await apiFetch('/api/sms/send', {
      method: 'POST',
      body: JSON.stringify({
        to: to,
        message: message
      })
    });

    const result = response;
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
