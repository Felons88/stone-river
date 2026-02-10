import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, Wallet, ArrowRight, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentGatewaySelectorProps {
  amount: number;
  onSelectGateway: (gateway: string) => void;
  onCancel: () => void;
}

const PaymentGatewaySelector = ({ amount, onSelectGateway, onCancel }: PaymentGatewaySelectorProps) => {
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const gateways = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Pay securely with Visa, Mastercard, or Amex',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      fees: '2.9% + $0.30'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: Wallet,
      color: 'from-[#0070ba] to-[#003087]',
      fees: '2.9% + $0.30'
    },
    {
      id: 'cashapp',
      name: 'Cash App',
      description: 'Pay with Cash App',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      fees: 'No fees'
    },
    {
      id: 'venmo',
      name: 'Venmo',
      description: 'Pay with Venmo',
      icon: Wallet,
      color: 'from-[#3d95ce] to-[#008cff]',
      fees: 'No fees'
    }
  ];

  const handleProceed = () => {
    if (selectedGateway) {
      onSelectGateway(selectedGateway);
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
        className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Select Payment Method</h2>
          <p className="text-gray-600">Choose how you'd like to pay</p>
          <div className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-full border-2 border-green-300">
            <span className="text-sm font-bold text-gray-700">Amount Due: </span>
            <span className="text-2xl font-black text-green-600">${amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {gateways.map((gateway) => {
            const Icon = gateway.icon;
            const isSelected = selectedGateway === gateway.id;
            
            return (
              <motion.button
                key={gateway.id}
                onClick={() => setSelectedGateway(gateway.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                
                <div className={`w-12 h-12 bg-gradient-to-br ${gateway.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-black text-gray-900 mb-1">{gateway.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{gateway.description}</p>
                <p className="text-xs text-gray-500 font-semibold">Processing fee: {gateway.fees}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Secure Payment</h4>
              <p className="text-sm text-blue-700">
                All transactions are encrypted and secure. We never store your payment information.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleProceed}
            disabled={!selectedGateway}
            className="flex-1 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold h-14 text-lg"
          >
            Continue to Payment
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="font-bold h-14 px-8"
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentGatewaySelector;
