// Email Service using Brevo SMTP
// This service handles real email sending via Brevo SMTP

export const sendBrevoEmail = async ({ 
  to, 
  subject, 
  html, 
  text 
}: { 
  to: string; 
  subject: string; 
  html: string; 
  text?: string;
}) => {
  try {
    console.log('📧 Brevo Email Service - Sending to:', to);
    console.log('📧 Subject:', subject);

    // Get SMTP credentials from environment
    const smtpHost = import.meta.env.VITE_SMTP_HOST;
    const smtpPort = import.meta.env.VITE_SMTP_PORT;
    const smtpUser = import.meta.env.VITE_SMTP_USER;
    const smtpPassword = import.meta.env.VITE_SMTP_PASSWORD;
    const fromEmail = import.meta.env.VITE_SMTP_FROM_EMAIL;
    const fromName = import.meta.env.VITE_SMTP_FROM_NAME;

    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
      throw new Error('Brevo SMTP credentials not configured');
    }

    // Send email via backend API
    const response = await fetch('http://localhost:3001/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        text: text || subject
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via Brevo:', result);
    
    return {
      success: result.success,
      message: result.message,
      messageId: result.messageId,
      to: to,
      timestamp: result.timestamp || new Date().toISOString()
    };

  } catch (error) {
    console.error('📧 Brevo Email error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendBrevoEmail;
