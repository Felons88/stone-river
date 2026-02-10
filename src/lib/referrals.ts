// Referral Program System
import { supabase } from './supabase';

export interface ReferralCode {
  id: string;
  code: string;
  customer_email: string;
  customer_name: string;
  credit_amount: number;
  times_used: number;
  max_uses: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ReferralCredit {
  id: string;
  customer_email: string;
  credit_amount: number;
  credit_source: string;
  referral_code?: string;
  used_amount: number;
  remaining_amount: number;
  invoice_id?: string;
  expires_at?: string;
  created_at: string;
}

// Generate referral code
export async function generateReferralCode(
  customerName: string,
  customerEmail: string
): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    // Call database function to generate unique code
    const { data, error } = await supabase
      .rpc('generate_referral_code', { p_customer_name: customerName });

    if (error) throw error;

    const code = data;

    // Insert referral code
    const { error: insertError } = await supabase
      .from('referral_codes')
      .insert([{
        code,
        customer_email: customerEmail,
        customer_name: customerName,
        credit_amount: 25.00,
        times_used: 0,
        is_active: true,
      }]);

    if (insertError) throw insertError;

    return { success: true, code };
  } catch (error: any) {
    console.error('Error generating referral code:', error);
    return { success: false, error: error.message };
  }
}

// Get customer's referral codes
export async function getCustomerReferralCodes(email: string): Promise<ReferralCode[]> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching referral codes:', error);
    return [];
  }
}

// Get customer's credits
export async function getCustomerCredits(email: string): Promise<ReferralCredit[]> {
  try {
    const { data, error } = await supabase
      .from('referral_credits')
      .select('*')
      .eq('customer_email', email)
      .gt('remaining_amount', 0)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching credits:', error);
    return [];
  }
}

// Calculate total available credit
export async function getTotalCredit(email: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('calculate_remaining_credit', { p_customer_email: email });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error calculating credit:', error);
    return 0;
  }
}

// Apply referral code (when new customer uses code)
export async function applyReferralCode(
  code: string,
  newCustomerEmail: string,
  newCustomerName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get referral code
    const { data: referralCode, error: codeError } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (codeError || !referralCode) {
      return { success: false, error: 'Invalid or inactive referral code' };
    }

    if (referralCode.times_used >= referralCode.max_uses) {
      return { success: false, error: 'Referral code has reached maximum uses' };
    }

    if (referralCode.expires_at && new Date(referralCode.expires_at) < new Date()) {
      return { success: false, error: 'Referral code has expired' };
    }

    // Give credit to referrer
    await supabase.from('referral_credits').insert([{
      customer_email: referralCode.customer_email,
      credit_amount: 25.00,
      credit_source: 'referral_given',
      referral_code: code,
      remaining_amount: 25.00,
    }]);

    // Give credit to new customer
    await supabase.from('referral_credits').insert([{
      customer_email: newCustomerEmail,
      credit_amount: 25.00,
      credit_source: 'referral_received',
      referral_code: code,
      remaining_amount: 25.00,
    }]);

    // Update referral code usage
    await supabase
      .from('referral_codes')
      .update({ times_used: referralCode.times_used + 1 })
      .eq('id', referralCode.id);

    return { success: true };
  } catch (error: any) {
    console.error('Error applying referral code:', error);
    return { success: false, error: error.message };
  }
}

// Apply credit to invoice
export async function applyCreditToInvoice(
  customerEmail: string,
  invoiceId: string,
  amount: number
): Promise<{ success: boolean; appliedAmount?: number; error?: string }> {
  try {
    const credits = await getCustomerCredits(customerEmail);
    let remainingAmount = amount;
    let totalApplied = 0;

    for (const credit of credits) {
      if (remainingAmount <= 0) break;

      const availableCredit = credit.remaining_amount;
      const toApply = Math.min(availableCredit, remainingAmount);

      await supabase
        .from('referral_credits')
        .update({
          used_amount: credit.used_amount + toApply,
          remaining_amount: credit.remaining_amount - toApply,
          invoice_id: invoiceId,
        })
        .eq('id', credit.id);

      totalApplied += toApply;
      remainingAmount -= toApply;
    }

    return { success: true, appliedAmount: totalApplied };
  } catch (error: any) {
    console.error('Error applying credit:', error);
    return { success: false, error: error.message };
  }
}

export default {
  generateReferralCode,
  getCustomerReferralCodes,
  getCustomerCredits,
  getTotalCredit,
  applyReferralCode,
  applyCreditToInvoice,
};
