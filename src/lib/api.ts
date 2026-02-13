import { supabase } from './supabase';
import { apiFetch } from './config';

// API Service Layer for all data operations

export const api = {
  // ==================== CLIENTS ====================
  clients: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (client: any) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    search: async (query: string) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },

  // ==================== INVOICES ====================
  invoices: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name, email, phone),
          items:invoice_items(*)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(*),
          items:invoice_items(*),
          payments:invoice_payments(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    getByPaymentLink: async (paymentLinkId: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          items:invoice_items(*)
        `)
        .eq('payment_link_id', paymentLinkId)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (invoice: any) => {
      // Generate invoice number: SRJR-{random}
      const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      const invoiceNumber = `SRJR-${randomStr}`;
      
      // Generate payment link ID
      const paymentLinkId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const paymentLinkExpiry = new Date();
      paymentLinkExpiry.setDate(paymentLinkExpiry.getDate() + 90); // 90 days expiry
      
      // Calculate totals
      const subtotal = invoice.items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unit_price), 0);
      const taxAmount = subtotal * (invoice.tax_rate / 100);
      const totalAmount = subtotal + taxAmount - (invoice.discount_amount || 0);
      
      // Create invoice
      const { data: newInvoice, error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          client_id: invoice.client_id,
          booking_id: invoice.booking_id,
          client_name: invoice.client_name,
          client_email: invoice.client_email,
          client_phone: invoice.client_phone,
          client_address: invoice.client_address,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: invoice.due_date,
          status: 'draft',
          subtotal: subtotal,
          tax_rate: invoice.tax_rate || 0,
          tax_amount: taxAmount,
          discount_amount: invoice.discount_amount || 0,
          total_amount: totalAmount,
          amount_paid: 0,
          balance_due: totalAmount,
          payment_link_id: paymentLinkId,
          payment_link_expires_at: paymentLinkExpiry.toISOString(),
          notes: invoice.notes,
          terms: invoice.terms
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add line items
      if (invoice.items && invoice.items.length > 0) {
        const items = invoice.items.map((item: any, index: number) => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          item_order: index
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);
        
        if (itemsError) throw itemsError;
      }
      
      return newInvoice;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    addItem: async (invoiceId: string, item: any) => {
      const { data, error } = await supabase
        .from('invoice_items')
        .insert([{ ...item, invoice_id: invoiceId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    removeItem: async (itemId: string) => {
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },

    markPaid: async (id: string, paymentData: any) => {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          amount_paid: paymentData.amount,
          balance_due: 0,
          payment_method: paymentData.method,
          payment_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;

      // Record payment transaction
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert([{
          invoice_id: id,
          client_id: invoice.client_id,
          amount: paymentData.amount,
          payment_method: paymentData.method,
          status: 'completed'
        }]);
      
      if (paymentError) throw paymentError;
      return invoice;
    },
  },

  // ==================== EMAIL CAMPAIGNS ====================
  emailCampaigns: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          recipients:email_campaign_recipients(
            *,
            subscriber:email_subscribers(*)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (campaign: any) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert([campaign])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    send: async (id: string) => {
      // Get all active subscribers
      const { data: subscribers } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('status', 'active');

      // Create recipient records
      const recipients = subscribers?.map(sub => ({
        campaign_id: id,
        subscriber_id: sub.id,
        status: 'sent',
        sent_at: new Date().toISOString()
      })) || [];

      const { error } = await supabase
        .from('email_campaign_recipients')
        .insert(recipients);
      
      if (error) throw error;

      // Update campaign status
      return api.emailCampaigns.update(id, {
        status: 'sent',
        sent_date: new Date().toISOString(),
        recipient_count: recipients.length
      });
    },
  },

  // ==================== EMAIL SUBSCRIBERS ====================
  emailSubscribers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    subscribe: async (email: string, name?: string) => {
      const { data, error } = await supabase
        .from('email_subscribers')
        .insert([{ email, name, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    unsubscribe: async (email: string) => {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
        .eq('email', email);
      if (error) throw error;
    },
  },

  // ==================== CLIENT COMMUNICATIONS ====================
  communications: {
    getByClient: async (clientId: string) => {
      const { data, error } = await supabase
        .from('client_communications')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (communication: any) => {
      const { data, error } = await supabase
        .from('client_communications')
        .insert([communication])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    getRecent: async (limit: number = 50) => {
      const { data, error } = await supabase
        .from('client_communications')
        .select(`
          *,
          client:clients(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  },

  // ==================== BUSINESS SETTINGS ====================
  settings: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*');
      if (error) throw error;
      return data;
    },

    get: async (key: string) => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single();
      if (error) throw error;
      return data?.setting_value;
    },

    set: async (key: string, value: string) => {
      const { data, error } = await supabase
        .from('business_settings')
        .upsert([{ setting_key: key, setting_value: value }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // ==================== BOOKINGS ====================
  bookings: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    checkAvailability: async (date: string, timeSlot: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('preferred_date', date)
        .eq('preferred_time', timeSlot)
        .in('status', ['pending', 'confirmed']);
      
      if (error) throw error;
      
      // Return true if slot is available (no bookings found)
      return {
        available: !data || data.length === 0,
        bookingCount: data?.length || 0,
        existingBookings: data || []
      };
    },

    getAvailableSlots: async (date: string) => {
      const allSlots = [
        "8:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 2:00 PM",
        "2:00 PM - 4:00 PM",
        "4:00 PM - 6:00 PM",
      ];

      const { data, error } = await supabase
        .from('bookings')
        .select('preferred_time')
        .eq('preferred_date', date)
        .in('status', ['pending', 'confirmed']);
      
      if (error) throw error;

      const bookedSlots = data?.map(b => b.preferred_time) || [];
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      return {
        availableSlots,
        bookedSlots,
        totalSlots: allSlots.length,
        availableCount: availableSlots.length
      };
    },

    create: async (booking: any) => {
      // Check availability before creating booking
      const availability = await api.bookings.checkAvailability(
        booking.preferred_date,
        booking.preferred_time
      );

      if (!availability.available) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    updateStatus: async (id: string, status: string) => {
      return api.bookings.update(id, { status });
    },
  },

  // ==================== GALLERY ====================
  gallery: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (item: any) => {
      const { data, error } = await supabase
        .from('gallery_items')
        .insert([item])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('gallery_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    uploadImage: async (file: File, folder: 'before' | 'after') => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
  },

  // ==================== BLOG ====================
  blog: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getBySlug: async (slug: string) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (post: any) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([post])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    publish: async (id: string) => {
      return api.blog.update(id, { status: 'published', published_at: new Date().toISOString() });
    },

    unpublish: async (id: string) => {
      return api.blog.update(id, { status: 'draft' });
    },
  },

  // ==================== REVIEWS ====================
  reviews: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    create: async (review: any) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert([review])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    approve: async (id: string) => {
      return api.reviews.update(id, { status: 'approved' });
    },

    reject: async (id: string) => {
      return api.reviews.update(id, { status: 'rejected' });
    },
  },

  // ==================== REFERRALS ====================
  referrals: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getByCode: async (code: string) => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', code)
        .single();
      if (error) throw error;
      return data;
    },

    create: async (referral: any) => {
      const { data, error } = await supabase
        .from('referrals')
        .insert([referral])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('referrals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    markComplete: async (id: string) => {
      return api.referrals.update(id, { status: 'completed', completed_at: new Date().toISOString() });
    },
  },

  // ==================== CONTACT FORMS ====================
  contacts: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    updateStatus: async (id: string, status: string) => {
      const { data, error } = await supabase
        .from('contact_forms')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('contact_forms')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  // ==================== SMS NOTIFICATIONS ====================
  sms: {
    getSubscribers: async () => {
      const { data, error } = await supabase
        .from('sms_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    subscribe: async (phone: string) => {
      const { data, error } = await supabase
        .from('sms_subscribers')
        .insert([{ phone, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    unsubscribe: async (phone: string) => {
      const { error } = await supabase
        .from('sms_subscribers')
        .update({ status: 'unsubscribed' })
        .eq('phone', phone);
      if (error) throw error;
    },

    sendNotification: async (bookingId: string, type: string, message: string) => {
      const { data, error } = await supabase
        .from('sms_notifications')
        .insert([{
          booking_id: bookingId,
          type,
          message,
          status: 'sent',
          sent_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // ==================== ANALYTICS ====================
  analytics: {
    getDashboardStats: async () => {
      const [bookings, contacts, reviews, referrals, clients] = await Promise.all([
        api.bookings.getAll(),
        api.contacts.getAll(),
        api.reviews.getAll(),
        api.referrals.getAll(),
        api.clients.getAll(),
      ]);

      return {
        totalBookings: bookings?.length || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        totalContacts: contacts?.length || 0,
        totalReviews: reviews?.length || 0,
        averageRating: reviews?.reduce((acc, r) => acc + r.rating, 0) / (reviews?.length || 1) || 0,
        totalReferrals: referrals?.length || 0,
        completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
        totalClients: clients?.length || 0,
      };
    },

    getRevenueStats: async () => {
      // Get all paid invoices for accurate revenue tracking
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('total_amount, status, amount_paid')
        .eq('status', 'paid');
      
      if (error) {
        console.error('Error fetching invoice revenue:', error);
        // Fallback to booking-based estimation
        const bookings = await api.bookings.getAll();
        const completed = bookings?.filter(b => b.status === 'completed') || [];
        
        const loadPricing: any = {
          quarter: 150,
          half: 250,
          threeQuarter: 350,
          full: 450,
        };

        const totalRevenue = completed.reduce((sum, b) => {
          return sum + (loadPricing[b.load_size] || 0);
        }, 0);

        return {
          totalRevenue,
          completedJobs: completed.length,
          averageJobValue: completed.length > 0 ? totalRevenue / completed.length : 0,
        };
      }

      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || inv.total_amount || 0), 0) || 0;
      const completedJobs = invoices?.length || 0;

      return {
        totalRevenue,
        completedJobs,
        averageJobValue: completedJobs > 0 ? totalRevenue / completedJobs : 0,
      };
    },
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    getUnread: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('read', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    markAllAsRead: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      if (error) throw error;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    create: async (notification: any) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // ==================== GOOGLE REVIEWS ====================
  googleReviews: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .order('review_date', { ascending: false });
      if (error) throw error;
      return data;
    },

    getPublished: async () => {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('status', 'published')
        .order('review_date', { ascending: false });
      if (error) throw error;
      return data;
    },

    getFeatured: async () => {
      const { data, error } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'published')
        .order('review_date', { ascending: false });
      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('google_reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('google_reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },

    syncNow: async () => {
      const result = await apiFetch('/api/reviews/sync', {
        method: 'POST'
      });
      if (!result.success) throw new Error(result.error);
      return result;
    },

    getSettings: async () => {
      const result = await apiFetch('/api/reviews/settings');
      if (!result.success) throw new Error(result.error);
      return result.settings;
    },

    updateSettings: async (settings: any) => {
      const result = await apiFetch('/api/reviews/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (!result.success) throw new Error(result.error);
      return result.settings;
    },

    getSyncHistory: async () => {
      const result = await apiFetch('/api/reviews/sync-history');
      if (!result.success) throw new Error(result.error);
      return result.history;
    },

    getStats: async () => {
      const { data, error } = await supabase.rpc('get_review_stats');
      if (error) throw error;
      return data;
    },
  },

  // ==================== BUSINESS CONFIG ====================
  config: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data;
    },

    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('business_config')
        .select('*')
        .eq('category', category)
        .order('config_key', { ascending: true });
      if (error) throw error;
      return data;
    },

    get: async (key: string) => {
      const { data, error } = await supabase
        .from('business_config')
        .select('config_value')
        .eq('config_key', key)
        .single();
      if (error) throw error;
      return data?.config_value;
    },

    set: async (key: string, value: string) => {
      const { data, error } = await supabase
        .from('business_config')
        .upsert([{ config_key: key, config_value: value }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    updateMultiple: async (configs: Array<{ config_key: string; config_value: string }>) => {
      const { data, error } = await supabase
        .from('business_config')
        .upsert(configs.map(c => ({ 
          config_key: c.config_key, 
          config_value: c.config_value,
          updated_at: new Date().toISOString()
        })))
        .select();
      if (error) throw error;
      return data;
    },
  },

  // ==================== AI AUTOMATION ====================
  ai: {
    generateBlogPost: async (topic: string) => {
      const gemini = await import('./gemini');
      return gemini.default.generateBlogPost(topic);
    },

    generateReviewResponse: async (reviewText: string, rating: number = 5) => {
      const gemini = await import('./gemini');
      return gemini.default.generateReviewResponse(reviewText, rating);
    },

    categorizeContact: async (message: string) => {
      const gemini = await import('./gemini');
      return gemini.default.categorizeContact(message);
    },

    suggestResponse: async (inquiry: string, category: string = 'general') => {
      const gemini = await import('./gemini');
      return gemini.default.suggestResponse(inquiry, category);
    },

    analyzeSentiment: async (text: string) => {
      const gemini = await import('./gemini');
      return gemini.default.analyzeSentiment(text);
    },

    generateSMSMessage: async (type: 'confirmation' | 'reminder' | 'on_way' | 'complete' | 'custom', bookingData: any) => {
      console.log('API: Generating SMS message', { type, bookingData });
      try {
        const gemini = await import('./gemini');
        const result = await gemini.default.generateSMSMessage(type, bookingData);
        console.log('API: Generated SMS result', result);
        return result;
      } catch (error) {
        console.error('API: SMS generation error:', error);
        throw error;
      }
    },
  },
};

export default api;
