import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  MessageSquare,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface DashboardHomeProps {
  stats: any;
  loading: boolean;
  onRefresh: () => void;
}

const DashboardHome = ({ stats, loading, onRefresh }: DashboardHomeProps) => {
  const { toast } = useToast();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  
  // Quick action modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  
  // Form states
  const [bookingForm, setBookingForm] = useState({
    client_id: '',
    name: '',
    email: '',
    phone: '',
    service_type: 'Junk Removal',
    preferred_date: '',
    preferred_time: '',
    address: '',
    notes: ''
  });
  
  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    client_email: '',
    service_name: '',
    amount: '',
    due_date: ''
  });
  const [clients, setClients] = useState<any[]>([]);
  
  const [emailForm, setEmailForm] = useState({
    client_id: '',
    to: '',
    subject: '',
    message: ''
  });
  
  const [smsForm, setSmsForm] = useState({
    client_id: '',
    to: '',
    message: ''
  });

  useEffect(() => {
    loadRecentActivity();
    loadUpcomingBookings();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsList = await api.clients.getAll();
      setClients(clientsList || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const notifications = await api.notifications.getAll();
      setRecentActivity(notifications?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadUpcomingBookings = async () => {
    try {
      const allBookings = await api.bookings.getAll();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = allBookings
        .filter((b: any) => {
          const bookingDate = new Date(b.preferred_date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate >= today && b.status !== 'completed' && b.status !== 'cancelled';
        })
        .sort((a: any, b: any) => new Date(a.preferred_date).getTime() - new Date(b.preferred_date).getTime())
        .slice(0, 5);
      setUpcomingBookings(upcoming);
    } catch (error) {
      console.error('Error loading upcoming bookings:', error);
    }
  };

  // Quick action handlers
  const handleCreateBooking = async () => {
    try {
      // Get selected client details if client is selected
      let bookingData = { ...bookingForm };
      
      if (bookingForm.client_id) {
        const selectedClient = clients.find(c => c.id === bookingForm.client_id);
        if (selectedClient) {
          bookingData.name = selectedClient.name;
          bookingData.email = selectedClient.email;
          bookingData.phone = selectedClient.phone;
        }
      }

      await api.bookings.create(bookingData);
      toast({ title: 'Success', description: 'Booking created successfully' });
      setShowBookingModal(false);
      setBookingForm({
        client_id: '',
        name: '',
        email: '',
        phone: '',
        service_type: 'Junk Removal',
        preferred_date: '',
        preferred_time: '',
        address: '',
        notes: ''
      });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create booking', variant: 'destructive' });
    }
  };

  const handleCreateInvoice = async () => {
    try {
      // Get selected client details
      const selectedClient = clients.find(c => c.id === invoiceForm.client_id);
      if (!selectedClient) {
        throw new Error('Please select a client');
      }

      const invoiceData = {
        client_id: invoiceForm.client_id,
        client_email: selectedClient.email,
        service_name: invoiceForm.service_name,
        amount: invoiceForm.amount,
        due_date: invoiceForm.due_date
      };

      await api.invoices.create(invoiceData);
      toast({ title: 'Success', description: 'Invoice created successfully' });
      setShowInvoiceModal(false);
      setInvoiceForm({
        client_id: '',
        client_email: '',
        service_name: '',
        amount: '',
        due_date: ''
      });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create invoice', variant: 'destructive' });
    }
  };

  const handleSendEmail = async () => {
    try {
      // Get selected client details if client is selected
      let emailData = { ...emailForm };
      
      if (emailForm.client_id) {
        const selectedClient = clients.find(c => c.id === emailForm.client_id);
        if (selectedClient) {
          emailData.to = selectedClient.email;
        }
      }

      const response = await fetch('http://localhost:3001/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'Email sent successfully' });
        setShowEmailModal(false);
        setEmailForm({
          client_id: '',
          to: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send email', variant: 'destructive' });
    }
  };

  const handleSendSms = async () => {
    try {
      // Get selected client details if client is selected
      let smsData = { ...smsForm };
      
      if (smsForm.client_id) {
        const selectedClient = clients.find(c => c.id === smsForm.client_id);
        if (selectedClient) {
          smsData.to = selectedClient.phone;
        }
      }

      const response = await fetch('http://localhost:3001/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smsData),
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'SMS sent successfully' });
        setShowSmsModal(false);
        setSmsForm({
          client_id: '',
          to: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send SMS', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      change: `${stats?.completedJobs || 0} jobs`,
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      change: `${stats?.pendingBookings || 0} pending`,
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings || 0,
      change: "Needs attention",
      trend: "neutral",
      icon: Calendar,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Jobs",
      value: stats?.completedJobs || 0,
      change: "All time",
      trend: "up",
      icon: CheckCircle,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating?.toFixed(1) || "5.0",
      change: `${stats?.totalReviews || 0} reviews`,
      trend: "up",
      icon: Star,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Avg Job Value",
      value: `$${stats?.averageJobValue?.toFixed(0) || 0}`,
      change: "Per completed job",
      trend: "up",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment_received': return DollarSign;
      case 'booking_created': return Calendar;
      case 'fraud_alert': return AlertCircle;
      case 'invoice_sent': return Mail;
      default: return MessageSquare;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatBookingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Today's schedule and upcoming jobs</p>
        </div>
        <Button onClick={onRefresh} variant="outline" className="font-bold">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-2xl p-6 border-2 border-gray-200 hover:shadow-xl transition-all cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-gray-600">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-primary font-bold">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, i) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.severity);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-8 h-8 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center ${colorClass}`}>
                      <ActivityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{formatTimeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-gray-900">Upcoming Bookings</h3>
            <Button variant="ghost" size="sm" className="text-primary font-bold">
              View Calendar
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No upcoming bookings</p>
              </div>
            ) : (
              upcomingBookings.map((booking, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                      {booking.name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{booking.name}</p>
                      <p className="text-xs text-gray-600 font-medium">{booking.service_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatBookingDate(booking.preferred_date)}</p>
                    <p className="text-xs text-gray-600 font-medium">{booking.preferred_time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-black mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setShowBookingModal(true)}
            className="bg-white text-primary hover:bg-gray-100 font-bold h-auto py-4"
          >
            <Calendar className="w-5 h-5 mr-2" />
            New Booking
          </Button>
          <Button 
            onClick={() => setShowInvoiceModal(true)}
            className="bg-white text-primary hover:bg-gray-100 font-bold h-auto py-4"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Create Invoice
          </Button>
          <Button 
            onClick={() => setShowEmailModal(true)}
            className="bg-white text-primary hover:bg-gray-100 font-bold h-auto py-4"
          >
            <Mail className="w-5 h-5 mr-2" />
            Send Email
          </Button>
          <Button 
            onClick={() => setShowSmsModal(true)}
            className="bg-white text-primary hover:bg-gray-100 font-bold h-auto py-4"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Send SMS
          </Button>
        </div>
      </div>

      {/* Quick Action Modals */}
      
      {/* New Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client (Optional)</Label>
              <Select value={bookingForm.client_id} onValueChange={(value) => {
                setBookingForm({...bookingForm, client_id: value});
                // Auto-fill client details when selected
                const selectedClient = clients.find(c => c.id === value);
                if (selectedClient) {
                  setBookingForm(prev => ({
                    ...prev,
                    client_id: value,
                    name: selectedClient.name,
                    email: selectedClient.email,
                    phone: selectedClient.phone
                  }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client (or enter manually)..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Name *</Label>
                <Input value={bookingForm.name} onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={bookingForm.email} onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})} placeholder="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input value={bookingForm.phone} onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} placeholder="(612) 555-1234" />
              </div>
              <div>
                <Label>Service Type</Label>
                <Select value={bookingForm.service_type} onValueChange={(value) => setBookingForm({...bookingForm, service_type: value})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junk Removal">Junk Removal</SelectItem>
                    <SelectItem value="Furniture Removal">Furniture Removal</SelectItem>
                    <SelectItem value="Appliance Removal">Appliance Removal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={bookingForm.preferred_date} onChange={(e) => setBookingForm({...bookingForm, preferred_date: e.target.value})} />
              </div>
              <div>
                <Label>Time *</Label>
                <Input value={bookingForm.preferred_time} onChange={(e) => setBookingForm({...bookingForm, preferred_time: e.target.value})} placeholder="10:00 AM" />
              </div>
            </div>
            <div>
              <Label>Address *</Label>
              <Input value={bookingForm.address} onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})} placeholder="123 Main St, City, State" />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={bookingForm.notes} onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})} placeholder="Additional notes..." />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateBooking} className="flex-1">Create Booking</Button>
              <Button variant="outline" onClick={() => setShowBookingModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client *</Label>
              <Select value={invoiceForm.client_id} onValueChange={(value) => setInvoiceForm({...invoiceForm, client_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Service Name *</Label>
              <Input value={invoiceForm.service_name} onChange={(e) => setInvoiceForm({...invoiceForm, service_name: e.target.value})} placeholder="Junk Removal Service" />
            </div>
            <div>
              <Label>Amount *</Label>
              <Input type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})} placeholder="250.00" />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateInvoice} className="flex-1">Create Invoice</Button>
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client (Optional)</Label>
              <Select value={emailForm.client_id} onValueChange={(value) => {
                setEmailForm({...emailForm, client_id: value});
                // Auto-fill client email when selected
                const selectedClient = clients.find(c => c.id === value);
                if (selectedClient) {
                  setEmailForm(prev => ({
                    ...prev,
                    client_id: value,
                    to: selectedClient.email
                  }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client (or enter manually)..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To *</Label>
              <Input type="email" value={emailForm.to} onChange={(e) => setEmailForm({...emailForm, to: e.target.value})} placeholder="recipient@example.com" />
            </div>
            <div>
              <Label>Subject *</Label>
              <Input value={emailForm.subject} onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})} placeholder="Email subject" />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea value={emailForm.message} onChange={(e) => setEmailForm({...emailForm, message: e.target.value})} placeholder="Email message..." rows={6} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSendEmail} className="flex-1">Send Email</Button>
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send SMS Modal */}
      <Dialog open={showSmsModal} onOpenChange={setShowSmsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Send SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client (Optional)</Label>
              <Select value={smsForm.client_id} onValueChange={(value) => {
                setSmsForm({...smsForm, client_id: value});
                // Auto-fill client phone when selected
                const selectedClient = clients.find(c => c.id === value);
                if (selectedClient) {
                  setSmsForm(prev => ({
                    ...prev,
                    client_id: value,
                    to: selectedClient.phone
                  }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client (or enter manually)..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input value={smsForm.to} onChange={(e) => setSmsForm({...smsForm, to: e.target.value})} placeholder="(612) 555-1234" />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea value={smsForm.message} onChange={(e) => setSmsForm({...smsForm, message: e.target.value})} placeholder="SMS message..." rows={4} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSendSms} className="flex-1">Send SMS</Button>
              <Button variant="outline" onClick={() => setShowSmsModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHome;
