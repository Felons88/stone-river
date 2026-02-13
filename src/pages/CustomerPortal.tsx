import { useState, useEffect } from 'react';
import { User, Calendar, FileText, CreditCard, LogOut, Settings, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import ReferralDashboard from '@/components/ReferralDashboard';
import CustomerAccountSettings from '@/components/CustomerAccountSettings';

const CustomerPortal = () => {
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
    // Check for admin view token first
    const urlParams = new URLSearchParams(window.location.search);
    const viewToken = urlParams.get('view_token');
    
    if (viewToken) {
      try {
        // Verify admin view token
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/customer/verify-view-token?token=${viewToken}`);
        
        if (!response.ok) {
          throw new Error('Invalid or expired token');
        }
        
        const data = await response.json();
        
        // Set user data from admin view
        setUser({
          ...data.client,
          isAdminView: true,
          expiresAt: data.expiresAt
        });
        
        loadData(data.client.email);
        return;
      } catch (error) {
        console.error('Admin view token error:', error);
        // Fall back to normal auth
      }
    }
    
    // Normal customer auth check
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
      // Load bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_email', email)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load referral credits (if table exists)
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
    { key: 'dashboard', label: 'Dashboard', icon: User },
    { key: 'bookings', label: 'My Bookings', icon: Calendar },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'referrals', label: 'Referrals', icon: Gift },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Customer Portal</h1>
              {user?.isAdminView && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                    ADMIN VIEW
                  </div>
                  <span className="text-sm text-gray-600">
                    Viewing as {user?.name} ({user?.email})
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                {user?.isAdminView ? 'Close View' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 space-y-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <TabIcon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h2 className="text-2xl font-black text-gray-900 mb-4">Welcome Back!</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                      <div className="text-2xl font-black text-gray-900">{bookings.length}</div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <FileText className="w-8 h-8 text-green-600 mb-2" />
                      <div className="text-2xl font-black text-gray-900">{invoices.length}</div>
                      <div className="text-sm text-gray-600">Invoices</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <Gift className="w-8 h-8 text-purple-600 mb-2" />
                      <div className="text-2xl font-black text-gray-900">${totalCredit.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Referral Credits</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-4">Recent Activity</h3>
                  {bookings.length === 0 ? (
                    <p className="text-gray-600">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.service_type}</p>
                            <p className="text-sm text-gray-600">{booking.preferred_date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-4">My Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No bookings yet</p>
                    <Button onClick={() => navigate('/booking')} className="bg-primary hover:bg-primary/90 font-bold">
                      Book a Service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => (
                      <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg">{booking.service_type}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-semibold">{booking.preferred_date}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-2 font-semibold">{booking.preferred_time || 'TBD'}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Address:</span>
                            <span className="ml-2 font-semibold">{booking.service_address}</span>
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
                <h2 className="text-2xl font-black text-gray-900 mb-4">Invoices</h2>
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No invoices yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice: any) => (
                      <div key={invoice.id} className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">Invoice #{invoice.invoice_number}</h3>
                            <p className="text-sm text-gray-600">{new Date(invoice.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-900">${invoice.total_amount}</div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                        {invoice.status !== 'paid' && (
                          <Button
                            onClick={() => navigate(`/invoice/${invoice.id}`)}
                            className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold"
                          >
                            Pay Now
                          </Button>
                        )}
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
      </div>
    </div>
  );
};

export default CustomerPortal;
