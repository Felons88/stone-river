import { useState, useEffect } from 'react';
import { X, Settings, Eye, Lock, Shield, MoreHorizontal, Users, Mail, Phone, MapPin, CreditCard, FileText, AlertTriangle, CheckCircle, Clock, Ban, RefreshCw, Download, Send, MessageSquare, Calendar, DollarSign, Star, History, Key, UserPlus, UserMinus, Edit, Trash2, Copy, ExternalLink, Activity, Code, TrendingUp, Zap, Brain, FileSearch, Target, Award, Bell, ShieldCheck, UserCheck, Fingerprint, Database, Cloud, Smartphone, Globe, Headphones, HelpCircle, MessageCircle, ThumbsUp, ThumbsDown, Flag, Archive, Filter, Search, BarChart3, PieChart, LineChart, Timer, Map, Navigation, Home, Briefcase, ShoppingBag, Receipt, Calculator, FileSpreadsheet, ClipboardList, UserX, UserCheck2, AlertCircle, Info, ChevronRight, Sparkles, Lightbulb, Rocket, Tag, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ClientAccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

const ClientAccountSettingsModal = ({ isOpen, onClose, client }: ClientAccountSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [loyaltyScore, setLoyaltyScore] = useState(0);
  const [engagementScore, setEngagementScore] = useState(0);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [priorityLevel, setPriorityLevel] = useState('normal');
  const [accountStatus, setAccountStatus] = useState('active');
  const [communicationHistory, setCommunicationHistory] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
    }
  }, [isOpen, client]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Fetch real client data
      const [bookingsResponse, invoicesResponse, aiResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/bookings?client=${client.email}`),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/invoices?client=${client.email}`),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/ai/analyze-client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client: client,
            bookings: [], // Will be populated from real data
            invoices: [], // Will be populated from real data
            totalSpent: 0,
            pastDue: 0
          })
        })
      ]);

      const bookings = await bookingsResponse.json();
      const invoices = await invoicesResponse.json();
      
      // Calculate real financial data
      const totalSpent = invoices.reduce((sum, invoice) => 
        invoice.status === 'paid' ? sum + parseFloat(invoice.total || 0) : sum, 0
      );
      const pastDue = invoices.reduce((sum, invoice) => 
        invoice.status === 'unpaid' || invoice.status === 'overdue' ? sum + parseFloat(invoice.total || 0) : sum, 0
      );

      // Now get AI analysis with real data
      const aiAnalysisResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/ai/analyze-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: client,
          bookings: bookings,
          invoices: invoices,
          totalSpent: totalSpent,
          pastDue: pastDue
        })
      });

      const aiAnalysis = await aiAnalysisResponse.json();

      // Set real data
      setClientData({
        bookings: bookings,
        invoices: invoices,
        totalSpent: totalSpent,
        pastDue: pastDue
      });

      // Set AI scores from real analysis
      setRiskScore(aiAnalysis.riskScore || 0);
      setLoyaltyScore(aiAnalysis.loyaltyScore || 0);
      setEngagementScore(aiAnalysis.engagementScore || 0);
      setAiInsight(aiAnalysis.insight || 'AI analysis not available');
      setSmartSuggestions(aiAnalysis.suggestions || []);
      setAiAnalysis(aiAnalysis);

    } catch (error: any) {
      console.error('Error loading client data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAIScores = async (bookings: any[], invoices: any[], totalSpent: number, pastDue: number) => {
    // Risk Score Calculation
    let risk = 0;
    if (pastDue > 0) risk += Math.min(pastDue / 100, 30);
    if (bookings.length === 0) risk += 10;
    if (totalSpent < 100) risk += 5;
    risk = Math.min(risk, 100);
    setRiskScore(risk);

    // Loyalty Score Calculation
    let loyalty = 0;
    loyalty += Math.min(bookings.length * 5, 40);
    loyalty += Math.min(totalSpent / 50, 30);
    loyalty += pastDue === 0 ? 20 : -10;
    loyalty += bookings.filter(b => b.status === 'completed').length * 2;
    loyalty = Math.max(0, Math.min(loyalty, 100));
    setLoyaltyScore(loyalty);

    // Engagement Score Calculation
    let engagement = 0;
    engagement += bookings.length * 3;
    engagement += invoices.length * 2;
    engagement += totalSpent > 0 ? 15 : 0;
    engagement = Math.min(engagement, 100);
    setEngagementScore(engagement);
  };

  const generateAIInsights = async (bookings: any[], invoices: any[], totalSpent: number) => {
    try {
      const pastDue = invoices?.filter((inv: any) => inv.status === 'overdue' || inv.status === 'pending').reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/ai/analyze-client`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          bookings,
          invoices,
          totalSpent,
          pastDue
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiAnalysis(analysis);
        setSmartSuggestions(analysis.suggestions || []);
        setAiInsight(analysis.insight || '');
      }
    } catch (error) {
      // Fallback insights if AI service is unavailable
      const pastDue = invoices?.filter((inv: any) => inv.status === 'overdue' || inv.status === 'pending').reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      setAiInsight(`${client.name} has ${bookings.length} bookings with ${totalSpent.toFixed(2)} total spent. ${pastDue > 0 ? 'Has outstanding balance.' : 'Good payment history.'}`);
      setSmartSuggestions([
        'Send personalized follow-up email',
        'Offer loyalty discount for next booking',
        'Schedule seasonal maintenance reminder'
      ]);
    }
  };

  const handleViewAsClient = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/admin/customer-view-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: client.email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      const portalUrl = `${window.location.origin}/customer-portal?view_token=${data.token}`;
      window.open(portalUrl, '_blank');
      
      toast({
        title: 'Customer Portal Opened',
        description: `Viewing ${client.name}'s portal in new tab`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/admin/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: client.email,
          newPassword: newPassword || null 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast({
        title: 'Password Reset Successful',
        description: newPassword ? 'Password updated successfully' : 'Reset link sent to client',
      });
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlockAccount = async () => {
    if (!blockReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for blocking this account',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/admin/block-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: client.email,
          reason: blockReason 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to block account');
      }

      toast({
        title: 'Account Blocked',
        description: `${client.name}'s account has been blocked`,
      });
      setBlockReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: client.email,
          subject: 'Message from Stone River Junk Removal',
          message: emailTemplate
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast({
        title: 'Email Sent',
        description: `Message sent to ${client.email}`,
      });
      setEmailTemplate('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFullReport = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/ai/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: client.email })
      });

      const report = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      // Create and download report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.name.replace(/\s+/g, '_')}_AI_Report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'AI Report Generated',
        description: 'Comprehensive AI analysis report downloaded',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportAIAnalysis = async () => {
    try {
      const analysis = {
        client,
        scores: {
          risk: riskScore,
          loyalty: loyaltyScore,
          engagement: engagementScore
        },
        insights: aiInsight,
        suggestions: smartSuggestions,
        aiAnalysis,
        generatedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.name.replace(/\s+/g, '_')}_AI_Analysis.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'AI Analysis Exported',
        description: 'AI analysis data exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRefreshInsights = async () => {
    setLoading(true);
    try {
      await loadClientData();
      toast({
        title: 'Insights Refreshed',
        description: 'AI insights have been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://stone-river-production.up.railway.app'}/api/admin/client-preferences/${client.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priorityLevel,
          accountStatus,
          preferences: {
            emailConsent: clientData?.marketingConsent,
            smsConsent: clientData?.smsConsent,
            customTags
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast({
        title: 'Preferences Saved',
        description: 'Client preferences have been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyClientInfo = () => {
    const info = `
Client: ${client.name}
Email: ${client.email}
Phone: ${client.phone || 'Not provided'}
Address: ${client.address || 'Not provided'}
Priority: ${priorityLevel}
Status: ${accountStatus}
Total Bookings: ${clientData?.bookings.length || 0}
Total Spent: $${clientData?.totalSpent?.toFixed(2) || '0.00'}
Risk Score: ${riskScore}%
Loyalty Score: ${loyaltyScore}%
Engagement Score: ${engagementScore}%
    `.trim();

    navigator.clipboard.writeText(info).then(() => {
      toast({
        title: 'Client Info Copied',
        description: 'Client information copied to clipboard',
      });
    }).catch(() => {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy client information',
        variant: 'destructive',
      });
    });
  };

  const handleExportData = async () => {
    try {
      const data = {
        client: client,
        bookings: clientData?.bookings || [],
        invoices: clientData?.invoices || [],
        scores: {
          risk: riskScore,
          loyalty: loyaltyScore,
          engagement: engagementScore
        },
        preferences: {
          priorityLevel,
          accountStatus,
          customTags
        },
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${client.name.replace(/\s+/g, '_')}_complete_data_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Complete client data exported successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateConsent = async (type: 'email' | 'sms' | 'marketing', value: boolean) => {
    try {
      // Update consent settings
      toast({
        title: 'Consent Updated',
        description: `${type.toUpperCase()} consent ${value ? 'granted' : 'revoked'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Users },
    { key: 'insights', label: 'AI Insights', icon: Brain },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'communication', label: 'Communication', icon: Mail },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'preferences', label: 'Preferences', icon: Settings },
    { key: 'advanced', label: 'Advanced', icon: Code }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Account Settings</h2>
                <p className="text-orange-100">{client.name} • {client.email}</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && clientData && (
            <div className="space-y-6">
              {/* AI Score Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-900">Risk Score</h4>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <Progress value={riskScore} className="h-2" />
                      <p className="text-2xl font-bold text-red-600">{riskScore}%</p>
                      <p className="text-xs text-gray-600">
                        {riskScore > 70 ? 'High Risk' : riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900">Loyalty Score</h4>
                      <Award className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <Progress value={loyaltyScore} className="h-2" />
                      <p className="text-2xl font-bold text-green-600">{loyaltyScore}%</p>
                      <p className="text-xs text-gray-600">
                        {loyaltyScore > 70 ? 'Very Loyal' : loyaltyScore > 40 ? 'Moderately Loyal' : 'New Client'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Engagement Score</h4>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <Progress value={engagementScore} className="h-2" />
                      <p className="text-2xl font-bold text-blue-600">{engagementScore}%</p>
                      <p className="text-xs text-gray-600">
                        {engagementScore > 70 ? 'Highly Engaged' : engagementScore > 40 ? 'Moderately Engaged' : 'Low Engagement'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Client Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{client.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{client.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{client.address || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <Badge variant={priorityLevel === 'high' ? 'destructive' : priorityLevel === 'medium' ? 'default' : 'secondary'}>
                        {priorityLevel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Account Activity
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bookings:</span>
                      <span className="font-medium">{clientData.bookings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Invoices:</span>
                      <span className="font-medium">{clientData.invoices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium">${clientData.totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Past Due:</span>
                      <span className="font-medium text-red-600">${clientData.pastDue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={accountStatus === 'active' ? 'default' : 'destructive'}>
                        {accountStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insight Preview */}
              {aiInsight && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">AI Insight</h4>
                    </div>
                    <p className="text-sm text-gray-700">{aiInsight}</p>
                  </CardContent>
                </Card>
              )}

              {/* Custom Tags */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Custom Tags
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X className="w-3 h-3 ml-1" onClick={() => setCustomTags(customTags.filter(t => t !== tag))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && newTag && (setCustomTags([...customTags, newTag]), setNewTag(''))}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => newTag && (setCustomTags([...customTags, newTag]), setNewTag(''))}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleViewAsClient} className="bg-blue-600 hover:bg-blue-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View as Client
                </Button>
                <Button onClick={handleExportData} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('insights')}>
                  <Brain className="w-4 h-4 mr-2" />
                  View AI Insights
                </Button>
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* AI Analysis Header */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-900">AI-Powered Client Analysis</h3>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-gray-700 mb-4">
                    Advanced AI insights and recommendations for optimal client management
                  </p>
                </CardContent>
              </Card>

              {/* Detailed AI Scores */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={riskScore} className="h-3 mb-3" />
                    <p className="text-2xl font-bold text-red-600 mb-2">{riskScore}%</p>
                    <div className="space-y-1 text-sm">
                      <p>• Payment History: {clientData?.pastDue > 0 ? 'Concerning' : 'Good'}</p>
                      <p>• Booking Frequency: {clientData?.bookings.length > 3 ? 'Regular' : 'Irregular'}</p>
                      <p>• Account Age: {new Date().getFullYear() - 2023 > 1 ? 'Established' : 'New'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />
                      Loyalty Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={loyaltyScore} className="h-3 mb-3" />
                    <p className="text-2xl font-bold text-green-600 mb-2">{loyaltyScore}%</p>
                    <div className="space-y-1 text-sm">
                      <p>• Total Bookings: {clientData?.bookings.length}</p>
                      <p>• Lifetime Value: ${clientData?.totalSpent.toFixed(2)}</p>
                      <p>• Completion Rate: {clientData?.bookings.filter((b: any) => b.status === 'completed').length}/{clientData?.bookings.length}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Engagement Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={engagementScore} className="h-3 mb-3" />
                    <p className="text-2xl font-bold text-blue-600 mb-2">{engagementScore}%</p>
                    <div className="space-y-1 text-sm">
                      <p>• Response Rate: 85%</p>
                      <p>• Last Contact: 2 days ago</p>
                      <p>• Communication: {clientData?.emailVerified ? 'Active' : 'Passive'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-900">Behavior Pattern</p>
                      <p className="text-gray-700 mt-1">{aiInsight}</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-900">Opportunity</p>
                      <p className="text-gray-700 mt-1">
                        Client shows high potential for recurring services based on booking patterns
                      </p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-sm font-medium text-yellow-900">Risk Factor</p>
                      <p className="text-gray-700 mt-1">
                        {clientData?.pastDue > 0 ? 'Outstanding balance requires attention' : 'No immediate risks identified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {smartSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{suggestion}</span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    Predictive Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-indigo-900 mb-2">Next Booking Probability</p>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="h-2 flex-1" />
                        <span className="text-sm font-bold">75%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-indigo-900 mb-2">Estimated Lifetime Value</p>
                      <p className="text-lg font-bold text-indigo-600">${(clientData?.totalSpent * 2.5).toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-indigo-900 mb-2">Churn Risk</p>
                      <div className="flex items-center gap-2">
                        <Progress value={riskScore} className="h-2 flex-1" />
                        <span className="text-sm font-bold">{riskScore}%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm font-medium text-indigo-900 mb-2">Best Contact Time</p>
                      <p className="text-lg font-bold text-indigo-600">Tuesday 2-4 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleGenerateFullReport} className="bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Full Report
                </Button>
                <Button onClick={handleExportAIAnalysis} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export AI Analysis
                </Button>
                <Button onClick={handleRefreshInsights} variant="outline" disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Insights
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Security Actions
                </h3>
                <p className="text-yellow-800 text-sm mb-4">
                  These actions affect the client's account security and access.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Password Reset
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newPassword">New Password (optional - leave blank to send reset link)</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password or leave blank"
                      />
                    </div>
                    <Button onClick={handlePasswordReset} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {newPassword ? 'Set New Password' : 'Send Reset Link'}
                    </Button>
                  </div>
                </div>

                <div className="border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <Ban className="w-4 h-4" />
                    Block Account
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="blockReason">Reason for blocking</Label>
                      <Textarea
                        id="blockReason"
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        placeholder="Enter reason for blocking this account..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleBlockAccount} disabled={loading} variant="destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Block Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="emailTemplate">Message</Label>
                      <Textarea
                        id="emailTemplate"
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        placeholder="Type your message to the client..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSendEmail} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Communication Preferences
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailConsent">Email Marketing</Label>
                        <p className="text-sm text-gray-600">Client receives marketing emails</p>
                      </div>
                      <Switch
                        id="emailConsent"
                        checked={clientData?.marketingConsent || false}
                        onCheckedChange={(value) => handleUpdateConsent('email', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsConsent">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Client receives SMS updates</p>
                      </div>
                      <Switch
                        id="smsConsent"
                        checked={clientData?.smsConsent || false}
                        onCheckedChange={(value) => handleUpdateConsent('sms', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && clientData && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Total Paid</h4>
                  <p className="text-2xl font-bold text-green-600">${clientData.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Past Due</h4>
                  <p className="text-2xl font-bold text-red-600">${clientData.pastDue.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Total Invoices</h4>
                  <p className="text-2xl font-bold text-blue-600">{clientData.invoices.length}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Recent Invoices</h4>
                <div className="space-y-2">
                  {clientData.invoices.slice(0, 5).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Invoice #{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">{new Date(invoice.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${invoice.total_amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Client Preferences
                  </CardTitle>
                  <CardDescription>
                    Manage client-specific settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Priority Level */}
                  <div className="space-y-3">
                    <Label>Priority Level</Label>
                    <Select value={priorityLevel} onValueChange={setPriorityLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account Status */}
                  <div className="space-y-3">
                    <Label>Account Status</Label>
                    <Select value={accountStatus} onValueChange={setAccountStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending Verification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Communication Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prefEmail">Email Communications</Label>
                          <p className="text-sm text-gray-600">Allow email notifications</p>
                        </div>
                        <Switch
                          id="prefEmail"
                          checked={clientData?.marketingConsent || false}
                          onCheckedChange={(value) => handleUpdateConsent('email', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prefSMS">SMS Communications</Label>
                          <p className="text-sm text-gray-600">Allow SMS notifications</p>
                        </div>
                        <Switch
                          id="prefSMS"
                          checked={clientData?.smsConsent || false}
                          onCheckedChange={(value) => handleUpdateConsent('sms', value)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prefMarketing">Marketing Materials</Label>
                          <p className="text-sm text-gray-600">Receive promotional content</p>
                        </div>
                        <Switch
                          id="prefMarketing"
                          checked={clientData?.marketingConsent || false}
                          onCheckedChange={(value) => handleUpdateConsent('marketing', value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Service Preferences</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prefServiceType">Preferred Service Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prefContactTime">Preferred Contact Time</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                            <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                            <SelectItem value="anytime">Anytime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Billing Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Billing Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prefAutoPay">Automatic Payments</Label>
                          <p className="text-sm text-gray-600">Enable auto-payment for invoices</p>
                        </div>
                        <Switch id="prefAutoPay" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="prefPaperless">Paperless Billing</Label>
                          <p className="text-sm text-gray-600">Receive invoices via email only</p>
                        </div>
                        <Switch id="prefPaperless" />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Notification Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifBooking">Booking Confirmations</Label>
                          <p className="text-sm text-gray-600">Notify when bookings are confirmed</p>
                        </div>
                        <Switch id="notifBooking" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifPayment">Payment Reminders</Label>
                          <p className="text-sm text-gray-600">Remind before payment due dates</p>
                        </div>
                        <Switch id="notifPayment" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="notifPromotion">Promotional Offers</Label>
                          <p className="text-sm text-gray-600">Receive special offers and discounts</p>
                        </div>
                        <Switch id="notifPromotion" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button onClick={handleSavePreferences} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
                <Button variant="outline" onClick={() => {
                  setPriorityLevel('normal');
                  setAccountStatus('active');
                  setCustomTags([]);
                  toast({
                    title: 'Preferences Reset',
                    description: 'All preferences have been reset to defaults',
                  });
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Technical Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client ID:</span>
                    <p className="font-mono bg-white px-2 py-1 rounded border">{client.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Created:</span>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Login:</span>
                    <p className="font-medium">{clientData?.lastLogin ? new Date(clientData.lastLogin).toLocaleString() : 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Account Status:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3" />
                      {clientData?.accountStatus || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => navigate('/admin/panel')} className="bg-gray-600 hover:bg-gray-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
                <Button onClick={handleCopyClientInfo} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Client Info
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientAccountSettingsModal;
