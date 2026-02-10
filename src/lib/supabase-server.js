// Server-side Supabase Client
// This file should only be used on the server (Node.js environment)
// NEVER import this in frontend code

import { createClient } from '@supabase/supabase-js';

// Environment variables are only available on the server
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create server-side Supabase client with service role key
// This client has elevated privileges and should ONLY be used server-side
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for common database operations
export const db = {
  // Bookings
  async getBookings(filters = {}) {
    let query = supabaseServer
      .from('bookings')
      .select('*');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.date) {
      query = query.eq('preferred_date', filters.date);
    }
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },
  
  async createBooking(booking) {
    const { data, error } = await supabaseServer
      .from('bookings')
      .insert([booking])
      .select()
      .single();
    return { data, error };
  },
  
  async updateBooking(id, updates) {
    const { data, error } = await supabaseServer
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
  
  // Clients
  async getClients() {
    const { data, error } = await supabaseServer
      .from('customer_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  async createClient(client) {
    const { data, error } = await supabaseServer
      .from('customer_accounts')
      .insert([client])
      .select()
      .single();
    return { data, error };
  },
  
  // Invoices
  async getInvoices(filters = {}) {
    let query = supabaseServer
      .from('invoices')
      .select('*');
    
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },
  
  async createInvoice(invoice) {
    const { data, error } = await supabaseServer
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    return { data, error };
  },
  
  // Notifications
  async getNotifications() {
    const { data, error } = await supabaseServer
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },
  
  async createNotification(notification) {
    const { data, error } = await supabaseServer
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    return { data, error };
  },
  
  async markNotificationAsRead(id) {
    const { data, error } = await supabaseServer
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    return { data, error };
  }
};

export default supabaseServer;
