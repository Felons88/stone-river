// Pricing Calculator Engine
import { supabase } from './supabase';

export interface PricingItem {
  id: string;
  item_name: string;
  category: string;
  base_price: number;
  volume_cubic_feet: number;
  weight_estimate_lbs: number;
  requires_special_handling: boolean;
  disposal_fee: number;
}

export interface SelectedItem extends PricingItem {
  quantity: number;
}

export interface PriceBreakdown {
  subtotal: number;
  disposal_fees: number;
  special_handling_fee: number;
  estimated_volume: number;
  estimated_weight: number;
  load_size: string;
  total: number;
}

// Truck capacity constants (cubic feet)
const TRUCK_CAPACITY = {
  quarter: 100,
  half: 200,
  three_quarter: 300,
  full: 400,
};

// Base pricing by load size
const BASE_LOAD_PRICING = {
  quarter: 150,
  half: 250,
  three_quarter: 350,
  full: 450,
};

// Get all pricing items
export async function getAllPricingItems(): Promise<PricingItem[]> {
  try {
    const { data, error } = await supabase
      .from('pricing_items')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('item_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pricing items:', error);
    return [];
  }
}

// Get items by category
export async function getItemsByCategory(category: string): Promise<PricingItem[]> {
  try {
    const { data, error } = await supabase
      .from('pricing_items')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('item_name', { ascending: true});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching items by category:', error);
    return [];
  }
}

// Calculate price breakdown
export function calculatePrice(selectedItems: SelectedItem[]): PriceBreakdown {
  let subtotal = 0;
  let disposal_fees = 0;
  let special_handling_fee = 0;
  let estimated_volume = 0;
  let estimated_weight = 0;

  // Calculate totals
  selectedItems.forEach((item) => {
    const itemTotal = item.base_price * item.quantity;
    const itemDisposal = item.disposal_fee * item.quantity;
    const itemVolume = item.volume_cubic_feet * item.quantity;
    const itemWeight = item.weight_estimate_lbs * item.quantity;

    subtotal += itemTotal;
    disposal_fees += itemDisposal;
    estimated_volume += itemVolume;
    estimated_weight += itemWeight;

    if (item.requires_special_handling) {
      special_handling_fee += 25 * item.quantity; // $25 per special handling item
    }
  });

  // Determine load size
  const load_size = determineLoadSize(estimated_volume);

  // Apply minimum pricing based on load size
  const minimum_price = BASE_LOAD_PRICING[load_size as keyof typeof BASE_LOAD_PRICING] || 0;
  const calculated_subtotal = Math.max(subtotal, minimum_price);

  const total = calculated_subtotal + disposal_fees + special_handling_fee;

  return {
    subtotal: calculated_subtotal,
    disposal_fees,
    special_handling_fee,
    estimated_volume,
    estimated_weight,
    load_size,
    total,
  };
}

// Determine load size based on volume
export function determineLoadSize(volume: number): string {
  if (volume <= TRUCK_CAPACITY.quarter) return 'quarter';
  if (volume <= TRUCK_CAPACITY.half) return 'half';
  if (volume <= TRUCK_CAPACITY.three_quarter) return 'three_quarter';
  return 'full';
}

// Get load size percentage
export function getLoadPercentage(volume: number): number {
  const percentage = (volume / TRUCK_CAPACITY.full) * 100;
  return Math.min(Math.round(percentage), 100);
}

// Format load size for display
export function formatLoadSize(loadSize: string): string {
  const formats: Record<string, string> = {
    quarter: '1/4 Truck Load',
    half: '1/2 Truck Load',
    three_quarter: '3/4 Truck Load',
    full: 'Full Truck Load',
  };
  return formats[loadSize] || loadSize;
}

// Save quote request
export async function saveQuoteRequest(
  customerName: string,
  email: string,
  phone: string,
  serviceAddress: string,
  selectedItems: SelectedItem[],
  priceBreakdown: PriceBreakdown,
  specialNotes?: string
) {
  try {
    const { data, error } = await supabase
      .from('quote_requests')
      .insert([{
        customer_name: customerName,
        email,
        phone,
        service_address: serviceAddress,
        selected_items: selectedItems,
        estimated_volume: `${priceBreakdown.estimated_volume} cubic feet`,
        estimated_price: priceBreakdown.total,
        special_notes: specialNotes,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, quote: data };
  } catch (error: any) {
    console.error('Error saving quote:', error);
    return { success: false, error: error.message };
  }
}

// Get popular items (most frequently quoted)
export async function getPopularItems(limit: number = 10): Promise<PricingItem[]> {
  try {
    // This would need a view or more complex query in production
    // For now, just return common items
    const { data, error } = await supabase
      .from('pricing_items')
      .select('*')
      .eq('is_active', true)
      .in('category', ['furniture', 'appliances'])
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching popular items:', error);
    return [];
  }
}

export default {
  getAllPricingItems,
  getItemsByCategory,
  calculatePrice,
  determineLoadSize,
  getLoadPercentage,
  formatLoadSize,
  saveQuoteRequest,
  getPopularItems,
};
