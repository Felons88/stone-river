import { useState, useEffect } from 'react';
import { User, Lock, Bell, Mail, Phone, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/config';

interface CustomerAccountSettingsProps {
  customerEmail: string;
}

const CustomerAccountSettings = ({ customerEmail }: CustomerAccountSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const { toast } = useToast();

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailBookingConfirmation: true,
    emailInvoices: true,
    emailPromotions: true,
    smsReminders: true,
    smsUpdates: false,
  });

  useEffect(() => {
    loadCustomerData();
  }, [customerEmail]);

  const loadCustomerData = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_accounts')
        .select('*')
        .eq('email', customerEmail)
        .single();

      if (error) throw error;

      setCustomer(data);
      setProfileForm({
        name: data.name || '',
        phone: data.phone || '',
      });

      // Load notification preferences if they exist
      const { data: prefsData } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_email', customerEmail)
        .single();

      if (prefsData) {
        setNotifications({
          emailBookingConfirmation: prefsData.email_booking_confirmation ?? true,
          emailInvoices: prefsData.email_invoices ?? true,
          emailPromotions: prefsData.email_promotions ?? true,
          smsReminders: prefsData.sms_reminders ?? true,
          smsUpdates: prefsData.sms_updates ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('customer_accounts')
        .update({
          name: profileForm.name,
          phone: profileForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('email', customerEmail);

      if (error) throw error;

      // Update localStorage
      const customerAuth = localStorage.getItem('customerAuth');
      if (customerAuth) {
        const auth = JSON.parse(customerAuth);
        auth.name = profileForm.name;
        auth.phone = profileForm.phone;
        localStorage.setItem('customerAuth', JSON.stringify(auth));
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });

      loadCustomerData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call backend API to change password
      const response = await apiFetch('/api/portal/change-password', {
        method: 'POST',
        body: JSON.stringify({
          email: customerEmail,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const result = response;

      if (result.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been updated successfully',
        });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to change password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);

    try {
      // Upsert notification preferences
      const { error } = await supabase
        .from('customer_preferences')
        .upsert({
          customer_email: customerEmail,
          email_booking_confirmation: notifications.emailBookingConfirmation,
          email_invoices: notifications.emailInvoices,
          email_promotions: notifications.emailPromotions,
          sms_reminders: notifications.smsReminders,
          sms_updates: notifications.smsUpdates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'customer_email',
        });

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Settings */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black text-gray-900">Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={customerEmail}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="(612) 555-1234"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black text-gray-900">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-bold text-gray-900">Booking Confirmations</div>
              <div className="text-sm text-gray-600">Receive email confirmations for bookings</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailBookingConfirmation}
              onChange={(e) => setNotifications({ ...notifications, emailBookingConfirmation: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-bold text-gray-900">Invoice Notifications</div>
              <div className="text-sm text-gray-600">Get notified when invoices are ready</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailInvoices}
              onChange={(e) => setNotifications({ ...notifications, emailInvoices: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-bold text-gray-900">Promotional Emails</div>
              <div className="text-sm text-gray-600">Special offers and updates</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailPromotions}
              onChange={(e) => setNotifications({ ...notifications, emailPromotions: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-bold text-gray-900">SMS Reminders</div>
              <div className="text-sm text-gray-600">Appointment reminders via text</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsReminders}
              onChange={(e) => setNotifications({ ...notifications, smsReminders: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-bold text-gray-900">SMS Updates</div>
              <div className="text-sm text-gray-600">Job status updates via text</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsUpdates}
              onChange={(e) => setNotifications({ ...notifications, smsUpdates: e.target.checked })}
              className="w-5 h-5"
            />
          </div>

          <Button
            onClick={handleUpdateNotifications}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAccountSettings;
