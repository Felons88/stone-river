import { useState, useEffect } from 'react';
import { User, Calendar, FileText, CreditCard, LogOut, Settings, Gift, TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ReferralDashboard from '@/components/ReferralDashboard';
import CustomerAccountSettings from '@/components/CustomerAccountSettings';

const CustomerPortalRedesigned = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const customerAuth = localStorage.getItem('customerAuth');
    if (!customerAuth) {
      navigate('/portal/login');
      return;
    }
    const customer = JSON.parse(customerAuth);
    setUser(customer);
    loadData(customer.email);
  };

  const loadData = async (email: string) => {
    setLoading(true);
    try {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_email', email)
        .order('created_at', { ascending: false })
        .limit(10);

      let totalCredits = 0;
      try {
        const { data: creditsData } = await supabase
          .from('referral_credits')
          .select('credit_amount')
          .eq('customer_email', email);
        
        totalCredits = creditsData?.reduce((sum, credit) => sum + (credit.credit_amount || 0), 0) || 0;
      } catch (error) {
        console.log('Referral credits not available yet');
      }

      setBookings(bookingsData || []);
      setInvoices(invoicesData || []);
      setTotalCredit(totalCredits);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('customerAuth');
    navigate('/portal/login');
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'bookings', label: 'My Bookings', icon: Calendar },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'referrals', label: 'Referrals', icon: Gift },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Pending Invoices',
      value: invoices.filter(inv => inv.status !== 'paid').length,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      label: 'Referral Credits',
      value: `$${totalCredit.toFixed(0)}`,
      icon: Gift,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Spent',
      value: `$${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0).toFixed(0)}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="font-bold border-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-4 font-bold transition-all relative ${
                    activeTab === tab.key
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm font-semibold text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 3).map((booking: any) => (
                      <div key={booking.id} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">{booking.service_type}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {booking.preferred_date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Invoices */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Recent Invoices</h3>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No invoices yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.slice(0, 3).map((invoice: any) => (
                      <div key={invoice.id} className="p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">Invoice #{invoice.invoice_number}</span>
                          <span className="text-lg font-black text-primary">${invoice.total_amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Due: {invoice.due_date}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold mb-4">No bookings yet</p>
                <Button className="bg-primary hover:bg-primary/90 font-bold">
                  Book a Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <div key={booking.id} className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">{booking.service_type}</h3>
                        <p className="text-sm text-gray-600">{booking.load_size}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 font-semibold">Date:</span>
                        <p className="text-gray-900 font-bold">{booking.preferred_date}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-semibold">Time:</span>
                        <p className="text-gray-900 font-bold">{booking.preferred_time || 'TBD'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 font-semibold">Address:</span>
                        <p className="text-gray-900 font-bold">{booking.service_address || booking.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Invoices</h2>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice: any) => (
                  <div key={invoice.id} className="p-6 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900">Invoice #{invoice.invoice_number}</h3>
                        <p className="text-sm text-gray-600">Issued: {invoice.issue_date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-primary">${invoice.total_amount?.toFixed(2)}</div>
                        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold mt-2 ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">Due Date:</span> {invoice.due_date}
                      </div>
                      {invoice.status !== 'paid' && invoice.payment_link_id && (
                        <Button
                          onClick={() => window.location.href = `/invoice/${invoice.payment_link_id}`}
                          className="bg-primary hover:bg-primary/90 font-bold"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'referrals' && user && (
          <ReferralDashboard customerEmail={user.email} customerName={user.name} />
        )}

        {activeTab === 'settings' && user && (
          <CustomerAccountSettings customerEmail={user.email} />
        )}
      </div>
    </div>
  );
};

export default CustomerPortalRedesigned;
