import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreditCard, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from '@/lib/config';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SSWp7KDSI5exJk0vybQo7jtEipRlzjF9H00B5mw4fyNBld4ng9TNASeShFQWonXginCo9e1kSOQwI6A2aYzbNGA00HKIb1uxF');

interface StripeCheckoutProps {
  amount: number;
  processingFee: number;
  totalAmount: number;
  invoiceId: string;
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ amount, processingFee, totalAmount, invoiceId, onSuccess, onBack, onCancel }: StripeCheckoutProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      console.log('Creating payment method...');

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
          address: { postal_code: zip }
        }
      });

      if (pmError) {
        console.error('Payment method creation error:', pmError);
        throw new Error(pmError.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      console.log('Payment method created:', paymentMethod.id);

      // Call backend to create payment intent
      const result = await apiFetch('/api/payment/stripe', {
        method: 'POST',
        body: JSON.stringify({
          amount: amount,
          processing_fee: processingFee,
          total_amount: totalAmount,
          invoice_id: invoiceId,
          payment_method_id: paymentMethod.id,
          name: name,
          email: email,
          zip: zip
        })
      });
      console.log('Backend response:', result);

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        onSuccess(result.transaction_id);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900">Card Payment</h2>
            <p className="text-gray-600">Secure payment powered by Stripe</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Invoice Amount:</span>
              <span className="font-bold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-semibold">Processing Fee (3.5%):</span>
              <span className="font-bold">${processingFee.toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-blue-300 pt-2 flex justify-between">
              <span className="text-lg font-black text-gray-900">Total to Pay:</span>
              <span className="text-2xl font-black text-blue-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Element */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Card Information</label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1f2937',
                      '::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                    invalid: {
                      color: '#ef4444',
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
            <Input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>

          {/* ZIP Code */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
            <Input
              type="text"
              placeholder="12345"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
              maxLength={5}
              required
              className="h-12 text-lg"
            />
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 mb-1">Secure & Encrypted</h4>
                <p className="text-sm text-green-700">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={processing || !stripe}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold h-14 text-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Pay ${totalAmount.toFixed(2)}
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={processing}
              className="font-bold h-14 px-8"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const StripeCheckout = (props: StripeCheckoutProps) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;
