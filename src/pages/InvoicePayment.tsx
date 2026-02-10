import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, DollarSign, CheckCircle, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PaymentGatewaySelector from "@/components/payment/PaymentGatewaySelector";
import StripeCheckout from "@/components/payment/StripeCheckout";
import PayPalCheckout from "@/components/payment/PayPalCheckout";
import CashAppVenmoCheckout from "@/components/payment/CashAppVenmoCheckout";

const InvoicePayment = () => {
  const { paymentLinkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  
  const STRIPE_FEE_PERCENTAGE = 0.035;
  const calculateStripeProcessingFee = (amount: number) => amount * STRIPE_FEE_PERCENTAGE;
  const calculateTotalWithStripeFee = (amount: number) => amount + calculateStripeProcessingFee(amount);

  useEffect(() => {
    loadInvoice();
  }, [paymentLinkId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await api.invoices.getByPaymentLink(paymentLinkId!);
      
      if (!data) {
        setError("Invoice not found or payment link has expired");
        return;
      }

      if (new Date(data.payment_link_expires_at) < new Date()) {
        setError("This payment link has expired. Please contact us for a new link.");
        return;
      }

      setInvoice(data);
    } catch (err: any) {
      console.error('Error loading invoice:', err);
      setError("Unable to load invoice. Please contact us for assistance.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    setShowPaymentSelector(true);
  };

  const handleSelectGateway = (gateway: string) => {
    setSelectedGateway(gateway);
    setShowPaymentSelector(false);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    toast({
      title: "Payment Successful!",
      description: "Your payment has been processed. Thank you!",
    });
    setSelectedGateway(null);
    await loadInvoice();
  };

  const handleBackToSelector = () => {
    setSelectedGateway(null);
    setShowPaymentSelector(true);
  };

  const handleCancelPayment = () => {
    setSelectedGateway(null);
    setShowPaymentSelector(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Invoice Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
              Return to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Invoice {invoice.invoice_number}
                </h1>
                <p className="text-gray-600">StoneRiver Junk Removal</p>
              </div>
              {isPaid && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full border-2 border-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">PAID</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Bill To:</h3>
                <p className="font-bold text-gray-900">{invoice.client_name}</p>
                <p className="text-gray-600">{invoice.client_email}</p>
                {invoice.client_phone && <p className="text-gray-600">{invoice.client_phone}</p>}
                {invoice.client_address && <p className="text-gray-600 mt-1">{invoice.client_address}</p>}
              </div>
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Invoice Date:</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(invoice.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Due Date:</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Services</h3>
              <div className="space-y-3">
                {invoice.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">${item.total_price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-gray-200 mt-6 pt-6">
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold">${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-semibold">Tax ({invoice.tax_rate}%):</span>
                    <span className="font-bold">${invoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-semibold">Discount:</span>
                    <span className="font-bold">-${invoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
                  <span className="text-xl font-black text-gray-900">Total:</span>
                  <span className="text-2xl font-black text-primary">${invoice.total_amount.toFixed(2)}</span>
                </div>
                {invoice.amount_paid > 0 && (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-semibold">Amount Paid:</span>
                      <span className="font-bold">${invoice.amount_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-lg font-black text-gray-900">Balance Due:</span>
                      <span className="text-xl font-black text-orange-600">${invoice.balance_due.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {invoice.terms && (
              <div className="border-t-2 border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Payment Terms:</h3>
                <p className="text-gray-700">{invoice.terms}</p>
              </div>
            )}

            {invoice.notes && (
              <div className="border-t-2 border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Notes:</h3>
                <p className="text-gray-700">{invoice.notes}</p>
              </div>
            )}
          </div>

          {!isPaid && (
            <div className="bg-gradient-to-r from-primary to-orange-600 rounded-2xl shadow-lg p-8 text-white">
              <h2 className="text-2xl font-black mb-4">Ready to Pay?</h2>
              <p className="mb-6 text-white/90">
                Choose your preferred payment method. All transactions are secure and encrypted.
              </p>
              
              <Button
                onClick={handlePayNow}
                className="w-full bg-white text-primary hover:bg-gray-100 h-16 text-lg font-bold"
              >
                <DollarSign className="w-6 h-6 mr-2" />
                PAY NOW
              </Button>

              <p className="text-sm text-white/70 mt-6 text-center">
                Questions? Contact us at (320) 204-0286 or noreply@stoneriverjunk.com
              </p>
            </div>
          )}

          {isPaid && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Received!</h2>
              <p className="text-gray-700">
                Thank you for your payment. This invoice has been marked as paid.
              </p>
              {invoice.payment_date && (
                <p className="text-sm text-gray-600 mt-2">
                  Paid on {new Date(invoice.payment_date).toLocaleDateString()}
                </p>
              )}
              
              <div className="mt-6 pt-6 border-t-2 border-green-200">
                <h3 className="text-lg font-black text-gray-900 mb-3">Enjoyed our service?</h3>
                <p className="text-gray-700 mb-4">
                  We'd love to hear about your experience! Your feedback helps us improve and helps others find great service.
                </p>
                <a
                  href="https://www.google.com/search?q=StoneRiver+Junk+Removal+St+Cloud+MN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <Star className="w-5 h-5" />
                  Leave a Google Review
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  (Google Business Profile coming soon - for now, search and review us!)
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Takes less than 2 minutes • Helps our small business grow
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showPaymentSelector && (
        <PaymentGatewaySelector
          amount={invoice.balance_due}
          onSelectGateway={handleSelectGateway}
          onCancel={handleCancelPayment}
        />
      )}

      {selectedGateway === 'stripe' && (
        <StripeCheckout
          amount={invoice.balance_due}
          processingFee={calculateStripeProcessingFee(invoice.balance_due)}
          totalAmount={calculateTotalWithStripeFee(invoice.balance_due)}
          invoiceId={invoice.id}
          onSuccess={handlePaymentSuccess}
          onBack={handleBackToSelector}
          onCancel={handleCancelPayment}
        />
      )}

      {selectedGateway === 'paypal' && (
        <PayPalCheckout
          amount={invoice.balance_due}
          invoiceId={invoice.id}
          onSuccess={handlePaymentSuccess}
          onBack={handleBackToSelector}
          onCancel={handleCancelPayment}
        />
      )}

      {selectedGateway === 'cashapp' && (
        <CashAppVenmoCheckout
          amount={invoice.balance_due}
          invoiceId={invoice.id}
          gateway="cashapp"
          onSuccess={handlePaymentSuccess}
          onBack={handleBackToSelector}
          onCancel={handleCancelPayment}
        />
      )}

      {selectedGateway === 'venmo' && (
        <CashAppVenmoCheckout
          amount={invoice.balance_due}
          invoiceId={invoice.id}
          gateway="venmo"
          onSuccess={handlePaymentSuccess}
          onBack={handleBackToSelector}
          onCancel={handleCancelPayment}
        />
      )}

      <Footer />
    </div>
  );
};

export default InvoicePayment;
