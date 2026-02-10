import { useState, useEffect } from 'react';
import { Check, Truck, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  getSubscriptionPlans,
  createSubscription,
  type SubscriptionPlan,
} from '@/lib/subscriptions';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    instructions: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await getSubscriptionPlans();
    setPlans(data);
    setLoading(false);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowSignup(true);
  };

  const handleSignup = async () => {
    if (!selectedPlan || !customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const result = await createSubscription(
      customerInfo.name,
      customerInfo.email,
      selectedPlan.id,
      customerInfo.address,
      customerInfo.instructions
    );

    if (result.success) {
      toast({
        title: 'Subscription Created!',
        description: "We'll contact you to set up billing and schedule your first pickup.",
      });
      setShowSignup(false);
      setCustomerInfo({ name: '', email: '', address: '', instructions: '' });
      setSelectedPlan(null);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create subscription',
        variant: 'destructive',
      });
    }
  };

  const frequencyLabels: Record<string, string> = {
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Subscription Plans
        </h1>
        <p className="text-xl text-gray-600">
          Save money with recurring junk removal service
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan, index) => {
          const isPopular = index === 1; // Make second plan popular

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:scale-105 ${
                isPopular
                  ? 'border-primary shadow-2xl'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {plan.plan_name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="text-4xl font-black text-primary mb-2">
                  ${plan.price_per_period}
                  <span className="text-lg text-gray-600 font-normal">
                    /{frequencyLabels[plan.frequency]}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {plan.included_pickups} pickup{plan.included_pickups > 1 ? 's' : ''} per period
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Up to {plan.max_volume_per_pickup}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Flexible scheduling
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Priority booking
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    Cancel anytime
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full font-bold ${
                  isPopular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                Select Plan
              </Button>
            </div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-primary/10 to-orange-50 rounded-2xl p-8">
        <h2 className="text-3xl font-black text-gray-900 mb-6 text-center">
          Why Subscribe?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Save Money</h3>
            <p className="text-gray-600">Up to 30% off compared to one-time pickups</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📅</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Hassle-Free</h3>
            <p className="text-gray-600">Automatic scheduling and billing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Priority Service</h3>
            <p className="text-gray-600">Skip the line with priority booking</p>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      {showSignup && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black mb-2">Subscribe to {selectedPlan.plan_name}</h3>
            <p className="text-gray-600 mb-6">
              ${selectedPlan.price_per_period}/{frequencyLabels[selectedPlan.frequency]}
            </p>
            
            <div className="space-y-4">
              <Input
                placeholder="Your Name *"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Email *"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
              <Input
                placeholder="Service Address *"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              />
              <textarea
                placeholder="Special instructions (optional)"
                value={customerInfo.instructions}
                onChange={(e) => setCustomerInfo({ ...customerInfo, instructions: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg"
                rows={3}
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSignup(false);
                    setSelectedPlan(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSignup}
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                >
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
