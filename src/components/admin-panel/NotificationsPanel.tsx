import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  DollarSign,
  AlertTriangle,
  Calendar,
  FileText,
  CheckCircle,
  X,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const NotificationsPanel = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = filter === 'unread' 
        ? await api.notifications.getUnread()
        : await api.notifications.getAll();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      toast({
        title: "Marked as read",
        description: "Notification marked as read",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({
        title: "All marked as read",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: "Deleted",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return DollarSign;
      case 'fraud_alert':
        return AlertTriangle;
      case 'booking_created':
        return Calendar;
      case 'invoice_sent':
        return FileText;
      default:
        return Bell;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-rose-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-blue-500 to-cyan-600';
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Notifications & Alerts</h2>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={loadNotifications} variant="outline" className="font-bold">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline" className="font-bold">
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className="font-bold"
        >
          All Notifications
        </Button>
        <Button
          onClick={() => setFilter('unread')}
          variant={filter === 'unread' ? 'default' : 'outline'}
          className="font-bold"
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-bold text-lg">No notifications</p>
              <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const colorClass = getColor(notification.severity);
              const bgClass = getBgColor(notification.severity);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`${bgClass} rounded-xl p-5 border-2 ${
                    notification.read ? 'border-gray-200' : 'border-primary'
                  } hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg font-black text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 font-semibold mb-3">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-semibold">
                          {new Date(notification.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              onClick={() => handleMarkAsRead(notification.id)}
                              size="sm"
                              variant="outline"
                              className="font-bold"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDelete(notification.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPanel;
