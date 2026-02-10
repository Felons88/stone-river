import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCw, CheckCircle, XCircle, BarChart3, Search, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

const GoogleSiteKitManager = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({
    property_id: '',
    analytics_id: '',
    search_console_url: '',
    tag_manager_id: '',
    adsense_client_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.siteKit.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading Site Kit settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.siteKit.updateSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Google Site Kit settings have been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading Site Kit settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Google Site Kit</h2>
          <p className="text-gray-600 mt-1">Manage Google services integration</p>
        </div>
        <div className="flex items-center gap-2">
          {settings?.is_connected && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full border-2 border-green-300">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Connected
            </span>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-black text-gray-900 mb-2">What is Google Site Kit?</h3>
        <p className="text-gray-700 mb-4">
          Google Site Kit connects your website with Google Analytics, Search Console, Tag Manager, and AdSense. 
          Configure your IDs below to enable tracking and analytics across your site.
        </p>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Analytics</p>
              <p className="text-gray-600">Track visitor behavior and conversions</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Search className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Search Console</p>
              <p className="text-gray-600">Monitor search performance</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-purple-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">Tag Manager</p>
              <p className="text-gray-600">Manage marketing tags</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900">AdSense</p>
              <p className="text-gray-600">Monetize your content</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200 space-y-6">
        <h3 className="text-xl font-black text-gray-900">Configuration</h3>

        {/* Google Analytics */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Google Analytics Measurement ID
          </label>
          <Input
            type="text"
            placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
            value={settings.analytics_id || ''}
            onChange={(e) => handleInputChange('analytics_id', e.target.value)}
            className="h-12 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Find this in Google Analytics → Admin → Data Streams
          </p>
        </div>

        {/* Google Tag Manager */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            Google Tag Manager Container ID
          </label>
          <Input
            type="text"
            placeholder="GTM-XXXXXXX"
            value={settings.tag_manager_id || ''}
            onChange={(e) => handleInputChange('tag_manager_id', e.target.value)}
            className="h-12 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Find this in Google Tag Manager → Container Settings
          </p>
        </div>

        {/* Search Console */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <Search className="w-4 h-4 inline mr-2" />
            Search Console Property URL
          </label>
          <Input
            type="text"
            placeholder="https://www.stoneriverjunk.com"
            value={settings.search_console_url || ''}
            onChange={(e) => handleInputChange('search_console_url', e.target.value)}
            className="h-12 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your verified property URL in Google Search Console
          </p>
        </div>

        {/* Google AdSense */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Google AdSense Publisher ID
          </label>
          <Input
            type="text"
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            value={settings.adsense_client_id || ''}
            onChange={(e) => handleInputChange('adsense_client_id', e.target.value)}
            className="h-12 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Find this in AdSense → Account → Settings
          </p>
        </div>

        {/* Property ID */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            <Settings className="w-4 h-4 inline mr-2" />
            Google Cloud Project Property ID
          </label>
          <Input
            type="text"
            placeholder="properties/XXXXXXXXX"
            value={settings.property_id || ''}
            onChange={(e) => handleInputChange('property_id', e.target.value)}
            className="h-12 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Advanced: Your Google Cloud project property identifier
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-bold h-12"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            onClick={loadSettings}
            variant="outline"
            className="font-bold h-12 px-8"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-black text-gray-900 mb-3">📝 Implementation Notes</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>1. Analytics:</strong> Add the tracking code to your website's <code className="bg-yellow-100 px-1 rounded">index.html</code> or use Google Tag Manager.
          </p>
          <p>
            <strong>2. Tag Manager:</strong> Install the GTM container snippet in your site's header and body tags.
          </p>
          <p>
            <strong>3. Search Console:</strong> Verify your domain ownership through DNS or HTML file upload.
          </p>
          <p>
            <strong>4. Integration:</strong> These settings are stored in your database and can be used by your frontend to initialize Google services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleSiteKitManager;
