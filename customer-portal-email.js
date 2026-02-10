// Customer Portal Credential Email Automation
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

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

// Send customer portal credentials
export async function sendPortalCredentials(email, name, password) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const portalUrl = 'https://stoneriverjunk.com/portal';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; margin: 20px 0; }
          .credential-item { margin: 15px 0; }
          .credential-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .credential-value { font-size: 18px; font-weight: bold; color: #1f2937; background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 5px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Your Customer Portal!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your StoneRiver Junk Removal customer portal account has been created! You can now:</p>
            <ul>
              <li>📅 Book new services</li>
              <li>📋 View past jobs and photos</li>
              <li>💰 View and pay invoices</li>
              <li>🎁 Access your referral rewards</li>
              <li>📊 Track your service history</li>
            </ul>

            <div class="credentials">
              <h3 style="margin-top: 0; color: #2563eb;">Your Login Credentials</h3>
              <div class="credential-item">
                <div class="credential-label">Username (Email)</div>
                <div class="credential-value">${email}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Access Your Portal</a>
            </div>

            <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <strong>⚠️ Security Tip:</strong> Please change your password after your first login for security purposes.
            </p>

            <p>If you have any questions or need assistance, feel free to contact us at <strong>${config.business_phone || '(612) 685-4696'}</strong></p>

            <p>Best regards,<br>
            <strong>The StoneRiver Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message from StoneRiver Junk Removal</p>
            <p>${config.business_address || 'St. Cloud, MN'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: email,
      subject: '🎉 Your Customer Portal is Ready!',
      html: htmlContent,
    });

    console.log(`✅ Portal credentials sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending portal credentials:', error);
    return { success: false, error: error.message };
  }
}

// Send password reset email
export async function sendPasswordReset(email, name, newPassword) {
  try {
    const config = await getConfig();
    const transporter = await createTransporter();

    const portalUrl = 'https://stoneriverjunk.com/portal';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; border: 2px solid #e5e7eb; margin: 20px 0; }
          .credential-value { font-size: 18px; font-weight: bold; color: #1f2937; background: #f3f4f6; padding: 10px; border-radius: 6px; margin-top: 5px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your password has been reset. Here is your new temporary password:</p>

            <div class="credentials">
              <div class="credential-value">${newPassword}</div>
            </div>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Login to Portal</a>
            </div>

            <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;">
              <strong>⚠️ Security:</strong> Please change this password immediately after logging in.
            </p>

            <p>If you didn't request this password reset, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"${config.business_name || 'StoneRiver Junk Removal'}" <noreply@stoneriverjunk.com>`,
      to: email,
      subject: '🔐 Password Reset - StoneRiver Portal',
      html: htmlContent,
    });

    console.log(`✅ Password reset sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset:', error);
    return { success: false, error: error.message };
  }
}

export default {
  sendPortalCredentials,
  sendPasswordReset,
};
