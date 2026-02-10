// Frontend API Client
// This file handles all API calls from the frontend
// Supabase credentials are NOT exposed here

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://stoneriverjunk.com/api' 
  : 'http://localhost:3001/api';

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
      return this.request(`/bookings?${params}`);
    },
    
    getById: (id) => this.request(`/bookings/${id}`),
    
    create: (booking) => this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
    
    update: (id, updates) => this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/bookings/${id}`, {
      method: 'DELETE',
    }),
    
    getAvailableSlots: (date) => this.request(`/bookings/available-slots?date=${date}`),
  };

  // Clients
  clients = {
    getAll: () => this.request('/clients'),
    
    getById: (id) => this.request(`/clients/${id}`),
    
    create: (client) => this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
    
    update: (id, updates) => this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/clients/${id}`, {
      method: 'DELETE',
    }),
    
    search: (query) => this.request(`/clients/search?q=${encodeURIComponent(query)}`),
  };

  // Invoices
  invoices = {
    getAll: (filters = {}) => {
      const params = new URLSearchParams(filters);
      return this.request(`/invoices?${params}`);
    },
    
    getById: (id) => this.request(`/invoices/${id}`),
    
    create: (invoice) => this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    }),
    
    update: (id, updates) => this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: (id) => this.request(`/invoices/${id}`, {
      method: 'DELETE',
    }),
  };

  // Notifications
  notifications = {
    getAll: () => this.request('/notifications'),
    
    getUnread: () => this.request('/notifications/unread'),
    
    markAsRead: (id) => this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    
    markAllAsRead: () => this.request('/notifications/read-all', {
      method: 'PUT',
    }),
    
    delete: (id) => this.request(`/notifications/${id}`, {
      method: 'DELETE',
    }),
    
    create: (notification) => this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
  };

  // Analytics
  analytics = {
    getDashboardStats: () => this.request('/analytics/dashboard'),
    
    getRevenueStats: () => this.request('/analytics/revenue'),
    
    getBookingStats: () => this.request('/analytics/bookings'),
    
    getClientStats: () => this.request('/analytics/clients'),
  };

  // Email
  email = {
    send: (emailData) => this.request('/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }),
    
    getTemplates: () => this.request('/email/templates'),
    
    sendTemplate: (templateId, data) => this.request(`/email/templates/${templateId}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // SMS
  sms = {
    send: (smsData) => this.request('/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    }),
    
    getSubscribers: () => this.request('/sms/subscribers'),
    
    subscribe: (phone) => this.request('/sms/subscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    unsubscribe: (phone) => this.request('/sms/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    sendNotification: (bookingId, type, message) => this.request('/sms/notification', {
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
      
      return this.request('/upload/job-photo', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    
    getJobPhotos: (bookingId) => this.request(`/upload/job-photos/${bookingId}`),
    
    deleteJobPhoto: (photoId) => this.request(`/upload/job-photo/${photoId}`, {
      method: 'DELETE',
    }),
  };

  // AI Assistant
  ai = {
    chat: (message) => this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
    
    analyzeBooking: (bookingId) => this.request(`/ai/analyze-booking/${bookingId}`),
    
    generateEmail: (type, data) => this.request('/ai/generate-email', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    }),
  };
}

// Create and export singleton instance
const api = new ApiClient();
export default api;
