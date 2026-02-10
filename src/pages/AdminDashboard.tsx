import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Image,
  FileText,
  Star,
  Gift,
  MessageSquare,
  Users,
  TrendingUp,
  DollarSign,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

// Import sub-components
import DashboardOverview from "@/components/admin/DashboardOverview";
import BookingsManager from "@/components/admin/BookingsManager";
import GalleryManager from "@/components/admin/GalleryManager";
import BlogManager from "@/components/admin/BlogManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import ReferralsManager from "@/components/admin/ReferralsManager";
import ContactsManager from "@/components/admin/ContactsManager";
import SMSManager from "@/components/admin/SMSManager";
import AIAssistant from "@/components/admin/AIAssistant";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const dashboardStats = await api.analytics.getDashboardStats();
      const revenueStats = await api.analytics.getRevenueStats();
      setStats({ ...dashboardStats, ...revenueStats });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'contacts', label: 'Contacts', icon: MessageSquare },
    { id: 'sms', label: 'SMS', icon: Bell },
    { id: 'ai', label: 'AI Assistant', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">StoneRiver Admin</h1>
                <p className="text-xs text-gray-500 font-semibold">Full Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {stats && (
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-bold text-gray-900">{stats.pendingBookings}</span>
                    <span className="text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-gray-900">${stats.totalRevenue?.toLocaleString()}</span>
                    <span className="text-gray-600">Revenue</span>
                  </div>
                </div>
              )}
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
        {/* Sidebar */}
        <div className="w-64 bg-white border-r-2 border-gray-200 min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <DashboardOverview stats={stats} loading={loading} onRefresh={loadStats} />}
            {activeTab === 'bookings' && <BookingsManager />}
            {activeTab === 'gallery' && <GalleryManager />}
            {activeTab === 'blog' && <BlogManager />}
            {activeTab === 'reviews' && <ReviewsManager />}
            {activeTab === 'referrals' && <ReferralsManager />}
            {activeTab === 'contacts' && <ContactsManager />}
            {activeTab === 'sms' && <SMSManager />}
            {activeTab === 'ai' && <AIAssistant />}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
