import { useState, useEffect } from 'react';
import { Gift, Copy, Share2, DollarSign, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  generateReferralCode,
  getCustomerReferralCodes,
  getTotalCredit,
  type ReferralCode,
} from '@/lib/referrals';

interface ReferralDashboardProps {
  customerEmail: string;
  customerName: string;
}

const ReferralDashboard = ({ customerEmail, customerName }: ReferralDashboardProps) => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [customerEmail]);

  const loadData = async () => {
    setLoading(true);
    const [codesData, creditData] = await Promise.all([
      getCustomerReferralCodes(customerEmail),
      getTotalCredit(customerEmail),
    ]);
    setCodes(codesData);
    setTotalCredit(creditData);
    setLoading(false);
  };

  const handleGenerateCode = async () => {
    // Check if customer already has a code
    if (codes.length > 0) {
      toast({
        title: 'Code Already Exists',
        description: 'You can only have one referral code',
        variant: 'destructive',
      });
      return;
    }

    const result = await generateReferralCode(customerName, customerEmail);
    if (result.success) {
      toast({
        title: 'Referral Code Created!',
        description: `Your code: ${result.code}`,
      });
      loadData();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to generate code',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShare = (code: string) => {
    const message = `Get $25 off your first junk removal with StoneRiver! Use my referral code: ${code}`;
    const url = `https://stoneriverjunk.com/booking?ref=${code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'StoneRiver Junk Removal Referral',
        text: message,
        url: url,
      });
    } else {
      handleCopy(`${message}\n${url}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading referral data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Gift className="w-10 h-10 text-primary" />
          Referral Program
        </h1>
        <p className="text-xl text-gray-600">
          Give $25, Get $25 - Share the love!
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-3" />
          <div className="text-3xl font-black mb-1">${totalCredit.toFixed(2)}</div>
          <div className="text-white/80">Available Credit</div>
        </div>
        
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <Users className="w-8 h-8 text-primary mb-3" />
          <div className="text-3xl font-black text-gray-900 mb-1">
            {codes.reduce((sum, code) => sum + code.times_used, 0)}
          </div>
          <div className="text-gray-600">Successful Referrals</div>
        </div>
        
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <Gift className="w-8 h-8 text-primary mb-3" />
          <div className="text-3xl font-black text-gray-900 mb-1">{codes.length}</div>
          <div className="text-gray-600">Active Codes</div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">1️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Share Your Code</h3>
            <p className="text-gray-600">Send your unique code to friends and family</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">2️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">They Save $25</h3>
            <p className="text-gray-600">Your friend gets $25 off their first service</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">3️⃣</span>
            </div>
            <h3 className="font-bold text-lg mb-2">You Earn $25</h3>
            <p className="text-gray-600">Get $25 credit when they complete their booking</p>
          </div>
        </div>
      </div>

      {/* Referral Codes */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">Your Referral Codes</h2>
          <Button
            onClick={handleGenerateCode}
            disabled={codes.length > 0}
            className="bg-primary hover:bg-primary/90 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Gift className="w-4 h-4 mr-2" />
            {codes.length > 0 ? 'Code Already Created' : 'Generate Code'}
          </Button>
        </div>

        {codes.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You don't have any referral codes yet</p>
            <Button
              onClick={handleGenerateCode}
              className="bg-primary hover:bg-primary/90 font-bold"
            >
              Create Your First Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {codes.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-2xl font-black text-primary">{code.code}</code>
                    {code.is_active && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Used {code.times_used} time{code.times_used !== 1 ? 's' : ''} • 
                    ${(code.times_used * code.credit_amount).toFixed(2)} earned
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(code.code)}
                    variant="outline"
                    size="sm"
                    className="font-bold"
                  >
                    {copied === code.code ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleShare(code.code)}
                    variant="outline"
                    size="sm"
                    className="font-bold"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Credit Usage */}
      {totalCredit > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
          <h3 className="text-xl font-black text-gray-900 mb-3">
            💰 You have ${totalCredit.toFixed(2)} in credit!
          </h3>
          <p className="text-gray-700">
            Your credit will be automatically applied to your next booking or invoice.
            Credits are valid for 1 year from the date earned.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;
