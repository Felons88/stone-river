import { useState, useEffect } from "react";
import { Mail, Send, Users, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import AIService from "@/services/aiService";

const EmailMarketing = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignType, setCampaignType] = useState("newsletter");
  const [targetAudience, setTargetAudience] = useState("all");
  const [generatedContent, setGeneratedContent] = useState("");
  const aiService = new AIService();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load campaigns (if table exists) or use mock data
      let campaignsData = [];
      let subscribersData = [];
      
      try {
        const { data: campaignData } = await supabase
          .from('email_campaigns')
          .select('*')
          .order('created_at', { ascending: false });
        campaignsData = campaignData || [];
      } catch (error) {
        console.log('Campaigns table not found, using mock data');
        campaignsData = [
          { id: 1, subject: 'Spring Cleaning Special', status: 'sent', sent_at: '2024-03-15' },
          { id: 2, subject: 'Summer Junk Removal Tips', status: 'draft', created_at: '2024-03-10' }
        ];
      }
      
      try {
        const { data: subscriberData } = await supabase
          .from('sms_subscribers')
          .select('*')
          .eq('status', 'active');
        subscribersData = subscriberData || [];
      } catch (error) {
        console.log('Subscribers table not found, using mock data');
        subscribersData = [
          { id: 1, phone: '612-555-1234', status: 'active', created_at: '2024-03-01' },
          { id: 2, phone: '612-555-5678', status: 'active', created_at: '2024-03-02' }
        ];
      }
      
      setCampaigns(campaignsData);
      setSubscribers(subscribersData);
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

  // Generate AI marketing content
  const generateMarketingContent = async () => {
    if (!campaignSubject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign subject",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate professional email marketing content for StoneRiver Junk Removal:

CAMPAIGN DETAILS:
- Subject: ${campaignSubject}
- Type: ${campaignType}
- Target Audience: ${targetAudience}
- Subscribers: ${subscribers.length} people

STONE RIVER INFO:
- Services: Residential, Commercial, Demolition junk removal
- Service Area: Central Minnesota (St. Cloud, Minneapolis, Twin Cities)
- Pricing: $150-$450 depending on load size
- Phone: (612) 685-4696
- Website: Available for online booking
- Specialties: Same-day service, eco-friendly disposal, licensed & insured

REQUIREMENTS:
- Write compelling, professional email copy
- Include clear call-to-action
- Keep tone friendly but professional
- Add relevant emojis for engagement
- Include contact information
- Make it conversion-focused
- Length: 200-300 words

Format as complete email with subject line and body.`;

      const aiResponse = await aiService.generateChatResponse(prompt);
      setGeneratedContent(aiResponse);
      
      toast({
        title: "Content Generated!",
        description: "AI has created your marketing content",
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
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

      {/* AI Content Generation Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-2xl font-black text-gray-900">AI Content Generator</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Subject</label>
            <Input
              placeholder="e.g., Spring Cleaning Special, Summer Junk Removal Tips"
              value={campaignSubject}
              onChange={(e) => setCampaignSubject(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Campaign Type</label>
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-purple-500"
            >
              <option value="newsletter">Newsletter</option>
              <option value="promotion">Promotion</option>
              <option value="announcement">Announcement</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Subscribers</option>
            <option value="residential">Residential Customers</option>
            <option value="commercial">Commercial Customers</option>
            <option value="recent">Recent Customers</option>
            <option value="inactive">Inactive Customers</option>
          </select>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={generateMarketingContent}
            disabled={aiLoading || !campaignSubject.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-bold"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Content
              </>
            )}
          </Button>
          
          {generatedContent && (
            <Button
              onClick={() => setGeneratedContent("")}
              variant="outline"
              className="font-bold"
            >
              Clear
            </Button>
          )}
        </div>

        {generatedContent && (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Generated Content</h4>
              <Button
                onClick={() => navigator.clipboard.writeText(generatedContent)}
                variant="outline"
                size="sm"
                className="font-bold"
              >
                Copy to Clipboard
              </Button>
            </div>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="w-full h-64 font-mono text-sm"
              placeholder="AI-generated content will appear here..."
            />
          </div>
        )}
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
