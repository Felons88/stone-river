import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authenticateCustomer } from '@/lib/customer-portal';

const PortalLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticateCustomer(email, password);

      if (result.success && result.customer) {
        // Store customer session
        localStorage.setItem('customerAuth', JSON.stringify(result.customer));
        
        toast({
          title: 'Welcome Back!',
          description: `Logged in as ${result.customer.name}`,
        });

        navigate('/portal/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary via-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-4">
            <span className="text-white font-black text-4xl">S</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Customer Portal</h1>
          <p className="text-gray-600">Access your bookings, photos, and invoices</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 font-bold text-lg py-6"
            >
              {loading ? 'Logging in...' : 'Login to Portal'}
            </Button>
          </form>

          {/* Help Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => {
                toast({
                  title: 'Password Reset',
                  description: 'Please contact us at (612) 685-4696 to reset your password',
                });
              }}
              className="text-sm text-primary hover:underline font-semibold"
            >
              Forgot your password?
            </button>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="tel:6126854696" className="text-primary hover:underline font-semibold">
                Call us to get started
              </a>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Call us at{' '}
            <a href="tel:6126854696" className="text-primary hover:underline font-bold">
              (612) 685-4696
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
