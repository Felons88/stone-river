import { useState, useEffect } from "react";
import { Settings, Save, Building2, Key, BarChart3, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";
import GoogleSiteKitManager from "./GoogleSiteKitManager";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'api_keys' | 'sitekit' | 'pricing'>('business');
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.config.getAll();
      const settingsObj = data?.reduce((acc: any, config: any) => {
        acc[config.config_key] = config.config_value;
        return acc;
      }, {});
      setSettings(settingsObj || {});
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const configs = Object.entries(settings).map(([key, value]) => ({
        config_key: key,
        config_value: value as string
      }));
      await api.config.updateMultiple(configs);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'business' as const, label: 'Business Info', icon: Building2 },
    { id: 'api_keys' as const, label: 'API Keys', icon: Key },
    { id: 'sitekit' as const, label: 'Google Site Kit', icon: BarChart3 },
    { id: 'pricing' as const, label: 'Pricing', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Configure your business and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-bold transition-all border-b-2 -mb-0.5 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Info Tab */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-6">Business Information</h3>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Name</label>
                <Input
                  value={settings.business_name || ''}
                  onChange={(e) => setSettings({...settings, business_name: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <Input
                  value={settings.business_phone || ''}
                  onChange={(e) => setSettings({...settings, business_phone: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={settings.business_email || ''}
                  onChange={(e) => setSettings({...settings, business_email: e.target.value})}
                  className="h-12"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Business Address</label>
              <Input
                value={settings.business_address || ''}
                onChange={(e) => setSettings({...settings, business_address: e.target.value})}
                className="h-12"
              />
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold h-12">
              <Save className="w-4 h-4 mr-2" />
              Save Business Info
            </Button>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api_keys' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-6">API Keys & Credentials</h3>
          <div className="space-y-6">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-semibold">
                🔒 These keys are stored securely and used by the server for integrations.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Stripe</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Secret Key</label>
                  <Input
                    type="password"
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})}
                    placeholder="sk_live_..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Publishable Key</label>
                  <Input
                    value={settings.stripe_publishable_key || ''}
                    onChange={(e) => setSettings({...settings, stripe_publishable_key: e.target.value})}
                    placeholder="pk_live_..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Twilio SMS</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account SID</label>
                  <Input
                    value={settings.twilio_account_sid || ''}
                    onChange={(e) => setSettings({...settings, twilio_account_sid: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Auth Token</label>
                  <Input
                    type="password"
                    value={settings.twilio_auth_token || ''}
                    onChange={(e) => setSettings({...settings, twilio_auth_token: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <Input
                    value={settings.twilio_phone_number || ''}
                    onChange={(e) => setSettings({...settings, twilio_phone_number: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Google Services</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Places API Key</label>
                  <Input
                    type="password"
                    value={settings.google_places_api_key || ''}
                    onChange={(e) => setSettings({...settings, google_places_api_key: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Place ID</label>
                  <Input
                    value={settings.google_place_id || ''}
                    onChange={(e) => setSettings({...settings, google_place_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Gemini API Key</label>
                  <Input
                    type="password"
                    value={settings.gemini_api_key || ''}
                    onChange={(e) => setSettings({...settings, gemini_api_key: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Email (SMTP)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Host</label>
                  <Input
                    value={settings.smtp_host || ''}
                    onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Port</label>
                  <Input
                    type="number"
                    value={settings.smtp_port || ''}
                    onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Username</label>
                  <Input
                    value={settings.smtp_user || ''}
                    onChange={(e) => setSettings({...settings, smtp_user: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">SMTP Password</label>
                  <Input
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => setSettings({...settings, smtp_password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold h-12">
              <Save className="w-4 h-4 mr-2" />
              Save API Keys
            </Button>
          </div>
        </div>
      )}

      {/* Site Kit Tab */}
      {activeTab === 'sitekit' && (
        <GoogleSiteKitManager />
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <h3 className="text-xl font-black text-gray-900 mb-6">Pricing Configuration</h3>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Quarter Load</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.pricing_quarter_load || ''}
                  onChange={(e) => setSettings({...settings, pricing_quarter_load: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Half Load</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.pricing_half_load || ''}
                  onChange={(e) => setSettings({...settings, pricing_half_load: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Three-Quarter Load</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.pricing_three_quarter_load || ''}
                  onChange={(e) => setSettings({...settings, pricing_three_quarter_load: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Load</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.pricing_full_load || ''}
                  onChange={(e) => setSettings({...settings, pricing_full_load: e.target.value})}
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stripe Processing Fee (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.stripe_processing_fee_percent || ''}
                  onChange={(e) => setSettings({...settings, stripe_processing_fee_percent: e.target.value})}
                  className="h-12"
                />
              </div>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold h-12">
              <Save className="w-4 h-4 mr-2" />
              Save Pricing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
