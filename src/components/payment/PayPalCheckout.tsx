import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PayPalCheckoutProps {
  amount: number;
  invoiceId: string;
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

const PayPalCheckout = ({ amount, invoiceId, onSuccess, onBack, onCancel }: PayPalCheckoutProps) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setProcessing(true);

    try {
      // Create PayPal order
      const response = await fetch('http://localhost:3001/api/payment/paypal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          invoice_id: invoiceId
        })
      });

      const result = await response.json();

      if (result.success && result.approval_url) {
        // Redirect to PayPal for approval
        window.location.href = result.approval_url;
      } else {
        throw new Error(result.error || 'Failed to create PayPal order');
      }
    } catch (error: any) {
      toast({
        title: "PayPal Error",
        description: error.message || "Failed to initialize PayPal payment. Please try again.",
        variant: "destructive",
      });
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
        className="bg-white rounded-2xl p-8 max-w-xl w-full"
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
            <h2 className="text-2xl font-black text-gray-900">PayPal Payment</h2>
            <p className="text-gray-600">You'll be redirected to PayPal</p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-[#0070ba] to-[#003087] rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Amount */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 mb-1">Amount to Pay</p>
            <p className="text-4xl font-black text-[#0070ba]">${amount.toFixed(2)}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900 mb-1">Secure Payment</p>
              <p className="text-sm text-blue-700">
                You'll be redirected to PayPal to complete your payment securely.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-900 mb-1">Buyer Protection</p>
              <p className="text-sm text-green-700">
                Your payment is protected by PayPal's buyer protection policy.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handlePayPalPayment}
            disabled={processing}
            className="flex-1 bg-[#0070ba] hover:bg-[#003087] text-white font-bold h-14 text-lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecting to PayPal...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Continue with PayPal
              </>
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={processing}
            className="font-bold h-14 px-8"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PayPalCheckout;
