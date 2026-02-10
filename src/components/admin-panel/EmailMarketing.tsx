import { useState, useEffect } from "react";
import { Mail, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

const EmailMarketing = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campaignsData, subscribersData] = await Promise.all([
        api.emailCampaigns.getAll(),
        api.emailSubscribers.getAll()
      ]);
      setCampaigns(campaignsData || []);
      setSubscribers(subscribersData || []);
    } catch (error) {
      console.error('Error loading email data:', error);
      toast({
        title: "Error",
        description: "Failed to load email marketing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Email Marketing</h2>
          <p className="text-gray-600 mt-1">Manage campaigns and newsletters</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-bold">
          <Mail className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <div className="text-sm font-bold text-blue-600">Total Subscribers</div>
          </div>
          <div className="text-3xl font-black text-blue-900">{subscribers.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-6 h-6 text-green-600" />
            <div className="text-sm font-bold text-green-600">Campaigns Sent</div>
          </div>
          <div className="text-3xl font-black text-green-900">
            {campaigns.filter(c => c.status === 'sent').length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6 text-purple-600" />
            <div className="text-sm font-bold text-purple-600">Active Subscribers</div>
          </div>
          <div className="text-3xl font-black text-purple-900">
            {subscribers.filter(s => s.status === 'active').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4">Recent Campaigns</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No campaigns yet</div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-bold text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-600">{campaign.subject}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMarketing;
