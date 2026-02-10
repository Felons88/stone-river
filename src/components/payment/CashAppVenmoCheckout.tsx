import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Wallet, ArrowLeft, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface CashAppVenmoCheckoutProps {
  amount: number;
  invoiceId: string;
  gateway: 'cashapp' | 'venmo';
  onSuccess: (transactionId: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

const CashAppVenmoCheckout = ({ amount, invoiceId, gateway, onSuccess, onBack, onCancel }: CashAppVenmoCheckoutProps) => {
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Business payment handles
  const paymentHandle = gateway === 'cashapp' ? '$StoneRiverJunk' : '@StoneRiverJunk';
  const appName = gateway === 'cashapp' ? 'Cash App' : 'Venmo';
  const color = gateway === 'cashapp' ? 'from-green-500 to-green-600' : 'from-[#3d95ce] to-[#008cff]';
  const Icon = gateway === 'cashapp' ? DollarSign : Wallet;

  const copyHandle = () => {
    navigator.clipboard.writeText(paymentHandle);
    toast({
      title: "Copied!",
      description: `${appName} handle copied to clipboard`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/api/payment/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoiceId,
          gateway: gateway,
          amount: amount,
          transaction_id: transactionId,
          payment_handle: paymentHandle
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Submitted!",
          description: "We'll verify your payment and update your invoice shortly.",
        });
        onSuccess(result.transaction_id);
      } else {
        throw new Error(result.error || 'Failed to submit payment');
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
        className="bg-white rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-2xl font-black text-gray-900">{appName} Payment</h2>
            <p className="text-gray-600">Send payment via {appName}</p>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Amount */}
        <div className={`bg-gradient-to-r ${color.replace('to-', 'to-').replace('from-', 'from-')}/10 rounded-xl p-6 mb-6 border-2 ${gateway === 'cashapp' ? 'border-green-200' : 'border-blue-200'}`}>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-700 mb-1">Amount to Send</p>
            <p className={`text-4xl font-black ${gateway === 'cashapp' ? 'text-green-600' : 'text-[#3d95ce]'}`}>
              ${amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 mb-3">Payment Instructions:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Open your {appName} app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Send <strong>${amount.toFixed(2)}</strong> to:</span>
              </li>
            </ol>
            
            {/* Payment Handle */}
            <div className="mt-3 flex items-center gap-2 bg-white rounded-lg p-3 border-2 border-blue-300">
              <span className="flex-1 font-black text-xl text-gray-900">{paymentHandle}</span>
              <Button
                onClick={copyHandle}
                size="sm"
                variant="outline"
                className="font-bold"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <ol className="space-y-2 text-sm text-blue-800 mt-3" start={3}>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Add note: <strong>Invoice #{invoiceId.slice(0, 8)}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Complete the payment and copy the transaction ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">5.</span>
                <span>Enter the transaction ID below</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-900 mb-1">Important</h4>
                <p className="text-sm text-yellow-800">
                  Make sure to send the exact amount and include the invoice note. Your payment will be verified within 1-2 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction ID Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Transaction ID / Reference Number
            </label>
            <Input
              type="text"
              placeholder="Enter your transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              className="h-12 text-lg"
            />
            <p className="text-xs text-gray-600 mt-1">
              You can find this in your {appName} transaction history
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitting || !transactionId}
              className={`flex-1 bg-gradient-to-r ${color} hover:opacity-90 text-white font-bold h-14 text-lg`}
            >
              {submitting ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 animate-pulse" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Payment Confirmation
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              disabled={submitting}
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

export default CashAppVenmoCheckout;
