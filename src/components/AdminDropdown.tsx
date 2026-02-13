import { useState, useEffect } from 'react';
import { ChevronDown, Settings, Eye, Lock, Shield, MoreHorizontal, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getAdminUser, logoutAdmin } from '@/lib/adminAuth';

const AdminDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    loadClients();
  }, []);

  const checkAdminStatus = () => {
    const adminUser = getAdminUser();
    setIsAdmin(!!adminUser);
  };

  const loadClients = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/clients`);
      if (response.ok) {
        const data = await response.json();
        setClients(data || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const openCustomerPortal = async (clientEmail: string, clientName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/admin/customer-view-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate customer view token');
      }

      const portalUrl = `${window.location.origin}/customer-portal?view_token=${data.token}`;
      window.open(portalUrl, '_blank');
      
      toast({
        title: 'Customer Portal Opened',
        description: `Viewing ${clientName}'s portal in new tab. Token expires in 1 hour.`,
      });
    } catch (error: any) {
      console.error('View as customer error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to open customer portal',
        variant: 'destructive',
      });
    }
    setIsOpen(false);
    setIsClientMenuOpen(false);
  };

  const handleAccountSettings = () => {
    navigate('/admin/panel');
    setIsOpen(false);
  };

  const handlePasswordReset = () => {
    toast({
      title: 'Password Reset',
      description: 'Password reset functionality coming soon',
    });
    setIsOpen(false);
  };

  const handleBlockAccount = () => {
    toast({
      title: 'Block Account',
      description: 'Account blocking functionality coming soon',
    });
    setIsOpen(false);
  };

  const handleOtherSettings = () => {
    toast({
      title: 'Other Settings',
      description: 'Additional settings coming soon',
    });
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
    setIsOpen(false);
  };

  if (!isAdmin) return null;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 font-bold shadow-lg"
      >
        <Settings className="w-4 h-4 mr-2" />
        Admin
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="py-2">
            <button
              onClick={handleAccountSettings}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Account Settings</span>
            </button>

            {/* View as Client with Submenu */}
            <div className="relative">
              <button
                onClick={() => setIsClientMenuOpen(!isClientMenuOpen)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="font-medium">View as Client</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isClientMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isClientMenuOpen && (
                <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Select Client
                    </div>
                    {clients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No clients available
                      </div>
                    ) : (
                      clients.map((client: any) => (
                        <button
                          key={client.id}
                          onClick={() => openCustomerPortal(client.email, client.name)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        >
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{client.name}</div>
                            <div className="text-xs text-gray-500">{client.email}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handlePasswordReset}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Password Reset</span>
            </button>

            <button
              onClick={handleBlockAccount}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Block Account</span>
            </button>

            <button
              onClick={handleOtherSettings}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
              <span className="font-medium">Other Account Settings</span>
            </button>

            <div className="border-t border-gray-200 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setIsClientMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AdminDropdown;
