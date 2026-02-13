// Frontend API Client
// This file handles all API calls from the frontend
// Supabase credentials are NOT exposed here

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminAuth');
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('adminAuth');
        window.location.href = '/admin/login';
        throw new Error('Session expired');
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.token = response.token;
      localStorage.setItem('adminAuth', response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('adminAuth');
  }

  // Bookings
  bookings = {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters);
      return this.request(`/api/bookings?${params}`);
    },
    
    getById: (id) => this.request(`/api/bookings/${id}`),
    
    create: (booking) => this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
    
    update: (id, updates) => this.request(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/api/bookings/${id}`, {
      method: 'DELETE',
    }),
    
    getAvailableSlots: (date) => this.request(`/api/bookings/available-slots?date=${date}`),
  };

  // Clients
  clients = {
    getAll: () => this.request('/api/clients'),
    
    getById: (id) => this.request(`/api/clients/${id}`),
    
    create: (client) => this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
    
    update: (id, updates) => this.request(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/api/clients/${id}`, {
      method: 'DELETE',
    }),
    
    search: (query) => this.request(`/api/clients/search?q=${encodeURIComponent(query)}`),
  };

  // Invoices
  invoices = {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters);
      return this.request(`/api/invoices?${params}`);
    },
    
    getById: (id) => this.request(`/api/invoices/${id}`),
    
    create: (invoice) => this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    }),
    
    update: (id, updates) => this.request(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/api/invoices/${id}`, {
      method: 'DELETE',
    }),
  };

  // Notifications
  notifications = {
    getAll: () => this.request('/api/notifications'),
    
    getUnread: () => this.request('/api/notifications/unread'),
    
    markAsRead: (id) => this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    }),
    
    markAllAsRead: () => this.request('/api/notifications/read-all', {
      method: 'PUT',
    }),
    
    delete: (id) => this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    }),
    
    create: (notification) => this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
  };

  // Analytics
  analytics = {
    getDashboardStats: () => this.request('/api/analytics/dashboard'),
    
    getRevenueStats: () => this.request('/api/analytics/revenue'),
    
    getBookingStats: () => this.request('/api/analytics/bookings'),
    
    getClientStats: () => this.request('/api/analytics/clients'),
  };

  // Email
  email = {
    send: (emailData) => this.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }),
    
    getTemplates: () => this.request('/api/email/templates'),
    
    sendTemplate: (templateId, data) => this.request(`/api/email/templates/${templateId}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // SMS
  sms = {
    send: (smsData) => this.request('/api/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    }),
    
    getSubscribers: () => this.request('/api/sms/subscribers'),
    
    subscribe: (phone) => this.request('/api/sms/subscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    unsubscribe: (phone) => this.request('/api/sms/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    sendNotification: (bookingId, type, message) => this.request('/api/sms/notification', {
      method: 'POST',
      body: JSON.stringify({ bookingId, type, message }),
    }),
  };

  // File Upload (Job Photos)
  upload = {
    uploadJobPhoto: (file, bookingId) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', bookingId);
      
      return this.request('/api/upload/job-photo', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    
    getJobPhotos: (bookingId) => this.request(`/api/upload/job-photos/${bookingId}`),
    
    deleteJobPhoto: (photoId) => this.request(`/api/upload/job-photo/${photoId}`, {
      method: 'DELETE',
    }),
  };

  // AI Assistant
  ai = {
    chat: (message) => this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
    
    analyzeBooking: (bookingId) => this.request(`/api/ai/analyze-booking/${bookingId}`),
    
    generateEmail: (type, data) => this.request('/api/ai/generate-email', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    }),
  };
}

// Create and export singleton instance
const api = new ApiClient();
export default api;
