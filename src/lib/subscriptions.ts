// Subscription Management System
import { supabase } from './supabase';
import { loadStripe } from '@stripe/stripe-js';

export interface SubscriptionPlan {
  id: string;
  plan_name: string;
  description: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  price_per_period: number;
  included_pickups: number;
  max_volume_per_pickup: string;
  stripe_price_id?: string;
  is_active: boolean;
}

export interface CustomerSubscription {
  id: string;
  customer_email: string;
  customer_name: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  current_period_start?: string;
  current_period_end?: string;
  next_pickup_date?: string;
  pickups_used: number;
  pickups_remaining?: number;
  service_address: string;
  special_instructions?: string;
}

// Get all subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_per_period', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

// Get customer subscriptions
export async function getCustomerSubscriptions(email: string): Promise<CustomerSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
}

// Create subscription
export async function createSubscription(
  customerName: string,
  customerEmail: string,
  planId: string,
  serviceAddress: string,
  specialInstructions?: string
) {
  try {
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .insert([{
        customer_name: customerName,
        customer_email: customerEmail,
        plan_id: planId,
        service_address: serviceAddress,
        special_instructions: specialInstructions,
        status: 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, subscription: data };
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
}

// Update subscription status
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'paused' | 'cancelled' | 'expired'
) {
  try {
    const { error } = await supabase
      .from('customer_subscriptions')
      .update({ status })
      .eq('id', subscriptionId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
}

// Record pickup usage
export async function recordPickup(subscriptionId: string) {
  try {
    const { data: subscription, error: fetchError } = await supabase
      .from('customer_subscriptions')
      .select('pickups_used, pickups_remaining')
      .eq('id', subscriptionId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from('customer_subscriptions')
      .update({
        pickups_used: (subscription.pickups_used || 0) + 1,
        pickups_remaining: Math.max((subscription.pickups_remaining || 0) - 1, 0),
      })
      .eq('id', subscriptionId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    console.error('Error recording pickup:', error);
    return { success: false, error: error.message };
  }
}

// Calculate next pickup date
export function calculateNextPickupDate(
  frequency: string,
  currentDate: Date = new Date()
): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
  }
  
  return nextDate;
}

export default {
  getSubscriptionPlans,
  getCustomerSubscriptions,
  createSubscription,
  updateSubscriptionStatus,
  recordPickup,
  calculateNextPickupDate,
};
