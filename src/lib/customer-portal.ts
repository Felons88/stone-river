import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// Generate random password
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Create customer portal account
export async function createCustomerPortalAccount(
  email: string,
  name: string,
  phone?: string
): Promise<{ success: boolean; password?: string; error?: string }> {
  try {
    // Check if account already exists
    const { data: existing } = await supabase
      .from('customer_accounts')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'Account already exists for this email',
      };
    }

    // Generate password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account
    const { data, error } = await supabase
      .from('customer_accounts')
      .insert([
        {
          email,
          name,
          phone,
          password_hash: hashedPassword,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      password,
    };
  } catch (error: any) {
    console.error('Error creating customer account:', error);
    return {
      success: false,
      error: error.message || 'Failed to create account',
    };
  }
}

// Authenticate customer
export async function authenticateCustomer(
  email: string,
  password: string
): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const { data: customer, error } = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !customer) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, customer.password_hash);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Update last login
    await supabase
      .from('customer_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', customer.id);

    return {
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
      },
    };
  } catch (error: any) {
    console.error('Error authenticating customer:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}

// Reset password
export async function resetCustomerPassword(
  email: string
): Promise<{ success: boolean; password?: string; error?: string }> {
  try {
    const { data: customer, error } = await supabase
      .from('customer_accounts')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !customer) {
      return {
        success: false,
        error: 'Account not found',
      };
    }

    // Generate new password
    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await supabase
      .from('customer_accounts')
      .update({ password_hash: hashedPassword })
      .eq('id', customer.id);

    return {
      success: true,
      password,
    };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      error: error.message || 'Failed to reset password',
    };
  }
}

// Get customer data
export async function getCustomerData(email: string) {
  try {
    // Get customer info
    const { data: customer } = await supabase
      .from('customer_accounts')
      .select('*')
      .eq('email', email)
      .single();

    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    // Get invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    // Get referral codes
    const { data: referralCodes } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('customer_email', email);

    // Get referral credits
    const { data: referralCredits } = await supabase
      .from('referral_credits')
      .select('*')
      .eq('customer_email', email)
      .eq('is_used', false);

    const totalCredit = referralCredits?.reduce((sum, credit) => sum + credit.credit_amount, 0) || 0;

    return {
      customer,
      bookings: bookings || [],
      invoices: invoices || [],
      referralCodes: referralCodes || [],
      totalCredit,
    };
  } catch (error) {
    console.error('Error getting customer data:', error);
    return null;
  }
}

export default {
  createCustomerPortalAccount,
  authenticateCustomer,
  resetCustomerPassword,
  getCustomerData,
  generatePassword,
};
