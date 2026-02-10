// Frontend API Client
// This file handles all API calls from the frontend
// Supabase credentials are NOT exposed here

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://stoneriverbackend-production.up.railway.app/api'
  : 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminAuth');
  }

  // Helper method for making requests
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
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
      throw error;
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string }) {
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
    getAll: async (filters: Record<string, any> = {}) => {
      const params = new URLSearchParams(filters);
      return this.request(`/bookings?${params}`);
    },
    
    getById: async (id: string) => this.request(`/bookings/${id}`),
    
    create: async (booking: Record<string, any>) => this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
    
    update: async (id: string, updates: Record<string, any>) => this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: async (id: string) => this.request(`/bookings/${id}`, {
      method: 'DELETE',
    }),
    
    getAvailableSlots: async (date: string) => this.request(`/bookings/available-slots?date=${date}`),
  };

  // Clients
  clients = {
    getAll: async () => this.request('/clients'),
    
    getById: async (id: string) => this.request(`/clients/${id}`),
    
    create: async (client: Record<string, any>) => this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
    
    update: async (id: string, updates: Record<string, any>) => this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: async (id: string) => this.request(`/clients/${id}`, {
      method: 'DELETE',
    }),
    
    search: async (query: string) => this.request(`/clients/search?q=${encodeURIComponent(query)}`),
  };

  // Invoices
  invoices = {
    getAll: async (filters: Record<string, any> = {}) => {
      const params = new URLSearchParams(filters);
      return this.request(`/invoices?${params}`);
    },
    
    getById: async (id: string) => this.request(`/invoices/${id}`),
    
    create: async (invoice: Record<string, any>) => this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    }),
    
    update: async (id: string, updates: Record<string, any>) => this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    
    delete: async (id: string) => this.request(`/invoices/${id}`, {
      method: 'DELETE',
    }),
  };

  // Notifications
  notifications = {
    getAll: async () => this.request('/notifications'),
    
    getUnread: async () => this.request('/notifications/unread'),
    
    markAsRead: async (id: string) => this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
    
    markAllAsRead: async () => this.request('/notifications/read-all', {
      method: 'PUT',
    }),
    
    delete: async (id: string) => this.request(`/notifications/${id}`, {
      method: 'DELETE',
    }),
    
    create: async (notification: Record<string, any>) => this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
  };

  // Analytics
  analytics = {
    getDashboardStats: async () => this.request('/analytics/dashboard'),
    
    getRevenueStats: async () => this.request('/analytics/revenue'),
    
    getBookingStats: async () => this.request('/analytics/bookings'),
    
    getClientStats: async () => this.request('/analytics/clients'),
  };

  // Email
  email = {
    send: async (emailData: Record<string, any>) => this.request('/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    }),
    
    getTemplates: async () => this.request('/email/templates'),
    
    sendTemplate: async (templateId: string, data: Record<string, any>) => this.request(`/email/templates/${templateId}/send`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  // SMS
  sms = {
    send: async (smsData: Record<string, any>) => this.request('/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData),
    }),
    
    getSubscribers: async () => this.request('/sms/subscribers'),
    
    subscribe: async (phone: string) => this.request('/sms/subscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    unsubscribe: async (phone: string) => this.request('/sms/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
    
    sendNotification: async (bookingId: string, type: string, message: string) => this.request('/sms/notification', {
      method: 'POST',
      body: JSON.stringify({ bookingId, type, message }),
    }),
  };

  // File Upload (Job Photos)
  upload = {
    uploadJobPhoto: async (file: File, bookingId: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', bookingId);
      
      return this.request('/upload/job-photo', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set Content-Type for FormData
      });
    },
    
    getJobPhotos: async (bookingId: string) => this.request(`/upload/job-photos/${bookingId}`),
    
    deleteJobPhoto: async (photoId: string) => this.request(`/upload/job-photo/${photoId}`, {
      method: 'DELETE',
    }),
  };

  // AI Assistant
  ai = {
    chat: async (message: string) => this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
    
    analyzeBooking: async (bookingId: string) => this.request(`/ai/analyze-booking/${bookingId}`),
    
    generateEmail: async (type: string, data: Record<string, any>) => this.request('/ai/generate-email', {
      method: 'POST',
      body: JSON.stringify({ type, data }),
    }),
  };
}

// Create and export singleton instance
const api = new ApiClient();
export default api;
