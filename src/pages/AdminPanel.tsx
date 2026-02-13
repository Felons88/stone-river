import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Mail,
  MessageSquare,
  DollarSign,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Bell,
  ChevronDown,
  ChevronRight,
  Image,
  Calculator,
  Repeat,
  Gift,
  MapPin,
  Package,
  Leaf,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { getAdminUser, isAdminAuthenticated, logoutAdmin } from "@/lib/adminAuth";

// Import admin modules
import AdminDashboardHome from "@/components/admin-panel/DashboardHome";
import ClientsManager from "@/components/admin-panel/ClientsManager";
import InvoicesManager from "@/components/admin-panel/InvoicesManager";
import PaymentsManager from "@/components/admin-panel/PaymentsManager";
import BookingScheduler from "@/components/admin-panel/BookingScheduler";
import EmailMarketing from "@/components/admin-panel/EmailMarketing";
import AIAssistantPanel from "@/components/admin-panel/AIAssistantPanel";
import SettingsPanel from "@/components/admin-panel/SettingsPanel";
import NotificationsPanel from "@/components/admin-panel/NotificationsPanel";
import GoogleReviewsManager from "@/components/admin-panel/GoogleReviewsManager";
import GoogleSiteKitManager from "@/components/admin-panel/GoogleSiteKitManager";
import PhotoGallery from "@/components/PhotoGallery";
import PricingCalculator from "@/components/PricingCalculator";
import ServiceCalendar from "@/components/ServiceCalendar";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import ReferralDashboard from "@/components/ReferralDashboard";
import JobTracker from "@/components/JobTracker";
import ItemInventory from "@/components/ItemInventory";
import DonationTracker from "@/components/DonationTracker";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<number>(0);
  const [invoicesExpanded, setInvoicesExpanded] = useState(false);
  const [bookingCount, setBookingCount] = useState<number>(0);
  const [clientCount, setClientCount] = useState<number>(0);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [notificationItems, setNotificationItems] = useState<any[]>([]);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  const adminUser = getAdminUser();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [navigate]);

  // Auto-hide notifications dropdown after 5 seconds when on dashboard
  useEffect(() => {
    // Clear existing timer
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      setAutoHideTimer(null);
    }

    // Set timer only if popup is open and we're on dashboard
    if (showNotificationsPopup && activeModule === 'dashboard') {
      const timer = setTimeout(() => {
        setShowNotificationsPopup(false);
      }, 5000); // 5 seconds
      setAutoHideTimer(timer);
    }
  }, [showNotificationsPopup, activeModule]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [autoHideTimer]);

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await api.analytics.getDashboardStats();
      const revenueStats = await api.analytics.getRevenueStats();
      setStats({ ...dashboardStats, ...revenueStats });
      
      // Get unread notifications count and items
      const allNotifications = await api.notifications.getAll();
      const unreadNotifications = allNotifications?.filter((n: any) => !n.read) || [];
      setNotifications(unreadNotifications.length);
      setNotificationItems(unreadNotifications.slice(0, 10)); // Show latest 10

      // Get real booking count (active bookings only)
      const bookings = await api.bookings.getAll();
      const activeBookings = bookings?.filter((b: any) => 
        b.status !== 'completed' && b.status !== 'cancelled'
      ) || [];
      setBookingCount(activeBookings.length);

      // Get real client count
      const clients = await api.clients.getAll();
      setClientCount(clients?.length || 0);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark notification as read
      await api.notifications.markAsRead(notification.id);
      
      // Update local state
      setNotificationItems(prev => prev.filter(n => n.id !== notification.id));
      setNotifications(prev => Math.max(0, prev - 1));
      
      // Handle notification action based on type
      if (notification.type === 'booking' && notification.booking_id) {
        setActiveModule('bookings');
      } else if (notification.type === 'client' && notification.client_id) {
        setActiveModule('clients');
      } else if (notification.type === 'alert') {
        setActiveModule('alerts');
      }
      
      setShowNotificationsPopup(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: AlertCircle,
      description: 'Notifications & Alerts',
      badge: notifications
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users,
      description: 'Client Management CMS',
      badge: clientCount
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: Calendar,
      description: 'Schedule & Calendar',
      badge: bookingCount
    },
    { 
      id: 'pricing', 
      label: 'Pricing Calculator', 
      icon: Calculator,
      description: 'Quote Generator'
    },
    { 
      id: 'subscriptions', 
      label: 'Subscriptions', 
      icon: Repeat,
      description: 'Recurring Services'
    },
    { 
      id: 'referrals', 
      label: 'Referral Program', 
      icon: Gift,
      description: 'Rewards & Credits'
    },
    { 
      id: 'gallery', 
      label: 'Photo Gallery', 
      icon: Image,
      description: 'Before/After Photos'
    },
    { 
      id: 'tracking', 
      label: 'Job Tracking', 
      icon: MapPin,
      description: 'Real-Time GPS'
    },
    { 
      id: 'inventory', 
      label: 'Item Inventory', 
      icon: Package,
      description: 'Disposal Tracking'
    },
    { 
      id: 'donations', 
      label: 'Donations', 
      icon: Leaf,
      description: 'Environmental Impact'
    },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      icon: Mail,
      description: 'Email & Newsletters'
    },
    { 
      id: 'ai', 
      label: 'AI Assistant', 
      icon: Sparkles,
      description: 'Automation & AI'
    },
    { 
      id: 'reviews', 
      label: 'Google Reviews', 
      icon: Star,
      description: 'Review Management'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Business Configuration'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">StoneRiver Admin</h1>
                <p className="text-xs text-gray-500 font-semibold">Complete Business Control</p>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-gray-600 font-semibold">Pending</div>
                    <div className="text-lg font-black text-blue-600">{stats.pendingBookings || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-600 font-semibold">Revenue</div>
                    <div className="text-lg font-black text-green-600">${stats.totalRevenue?.toLocaleString() || 0}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-600 font-semibold">Clients</div>
                    <div className="text-lg font-black text-purple-600">{stats.totalClients || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotificationsPopup(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Notifications & Alerts"
              >
                <Bell className={`w-5 h-5 ${notifications > 0 ? 'text-primary' : 'text-gray-600'}`} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="font-bold"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-72 bg-white border-r-2 border-gray-200 min-h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* CORE SECTION */}
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase mb-2 px-2">Core</h3>
              <div className="space-y-1">
                {menuItems.filter(item => ['dashboard', 'clients', 'bookings'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-black ${
                        activeModule === item.id ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* REVENUE SECTION */}
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase mb-2 px-2">Revenue</h3>
              <div className="space-y-1">
                {menuItems.filter(item => ['pricing'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* OPERATIONS SECTION */}
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase mb-2 px-2">Operations</h3>
              <div className="space-y-1">
                {menuItems.filter(item => ['donations'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* MARKETING SECTION */}
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase mb-2 px-2">Marketing</h3>
              <div className="space-y-1">
                {menuItems.filter(item => ['marketing', 'reviews', 'ai'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* SETTINGS SECTION */}
            <div>
              <h3 className="text-xs font-black text-gray-500 uppercase mb-2 px-2">System</h3>
              <div className="space-y-1">
                {menuItems.filter(item => ['settings'].includes(item.id)).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold transition-all ${
                      activeModule === item.id
                        ? 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'text-white' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Invoices Dropdown */}
            <div>
              <button
                onClick={() => setInvoicesExpanded(!invoicesExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <div className="text-sm font-black">Invoices & Payments</div>
                    <div className="text-xs text-gray-500">Billing Management</div>
                  </div>
                </div>
                {invoicesExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {invoicesExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  <button
                    onClick={() => setActiveModule('invoices')}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeModule === 'invoices'
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Invoices</span>
                  </button>
                  <button
                    onClick={() => setActiveModule('payments')}
                    className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeModule === 'payments'
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Payments</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t-2 border-gray-200">
            <h3 className="text-xs font-black text-gray-500 uppercase mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => setActiveModule('clients')}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Client
              </Button>
              <Button 
                onClick={() => setActiveModule('invoices')}
                className="w-full justify-start bg-green-600 hover:bg-green-700 text-sm"
                size="sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button 
                onClick={() => setActiveModule('bookings')}
                className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-sm"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Job
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeModule === 'dashboard' && <AdminDashboardHome stats={stats} loading={loading} onRefresh={loadDashboardData} />}
            {activeModule === 'alerts' && <NotificationsPanel />}
            {activeModule === 'clients' && <ClientsManager />}
            {activeModule === 'invoices' && <InvoicesManager />}
            {activeModule === 'payments' && <PaymentsManager />}
            {activeModule === 'bookings' && <BookingScheduler />}
            {activeModule === 'pricing' && <PricingCalculator />}
            {activeModule === 'donations' && <DonationTracker showFullDashboard={true} />}
            {activeModule === 'marketing' && <EmailMarketing />}
            {activeModule === 'ai' && <AIAssistantPanel />}
            {activeModule === 'reviews' && <GoogleReviewsManager />}
            {activeModule === 'settings' && <SettingsPanel />}
          </motion.div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotificationsPopup && (
        <div className="absolute top-16 right-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary to-orange-600 text-white p-3">
              <h3 className="text-sm font-bold">Notifications</h3>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {notificationItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificationItems.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        handleNotificationClick(notification);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          notification.type === 'booking' ? 'bg-blue-500' :
                          notification.type === 'alert' ? 'bg-red-500' :
                          notification.type === 'system' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{notification.title}</p>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notificationItems.length > 0 && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    setShowNotificationsPopup(false);
                    setActiveModule('alerts');
                  }}
                  className="w-full text-center text-xs text-primary hover:underline py-1"
                >
                  View All Notifications →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {showNotificationsPopup && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotificationsPopup(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
