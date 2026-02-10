import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, DollarSign, Send, CheckCircle, X, Mail, MessageSquare, Eye, Trash2, Copy, Calendar, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";
import InvoiceCreateModal from "./InvoiceCreateModal";

const InvoicesManager = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    booking_id: '',
    due_date: '',
    tax_rate: 0,
    discount_amount: 0,
    notes: '',
    terms: 'Payment due within 30 days',
    items: [{ description: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    loadInvoices();
    loadClients();
    loadBookings();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await api.invoices.getAll();
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await api.clients.getAll();
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await api.bookings.getAll();
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      if (!selectedClient) {
        toast({ title: "Error", description: "Please select a client", variant: "destructive" });
        return;
      }

      const invoice = await api.invoices.create({
        client_id: formData.client_id,
        booking_id: formData.booking_id || null,
        client_name: selectedClient.name,
        client_email: selectedClient.email,
        client_phone: selectedClient.phone,
        client_address: selectedClient.address,
        due_date: formData.due_date,
        tax_rate: formData.tax_rate,
        discount_amount: formData.discount_amount,
        notes: formData.notes,
        terms: formData.terms,
        items: formData.items
      });

      toast({ title: "Success", description: "Invoice created successfully" });
      setShowCreateModal(false);
      loadInvoices();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create invoice", variant: "destructive" });
    }
  };

  const handleSendInvoice = async (invoice: any, method: 'email' | 'sms') => {
    try {
      const paymentLink = `${window.location.origin}/invoice/${invoice.payment_link_id}`;
      
      if (method === 'email') {
        await fetch('http://localhost:3001/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: invoice.client_email,
            subject: `Invoice ${invoice.invoice_number} from StoneRiver Junk Removal`,
            html: `
              <h2>Invoice ${invoice.invoice_number}</h2>
              <p>Dear ${invoice.client_name},</p>
              <p>Your invoice is ready. Please review and pay online:</p>
              <p><strong>Amount Due: $${invoice.total_amount.toFixed(2)}</strong></p>
              <p><strong>Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</strong></p>
              <p><a href="${paymentLink}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View & Pay Invoice</a></p>
              <p>Thank you for your business!</p>
              <p>StoneRiver Junk Removal</p>
            `
          })
        });
      } else {
        await fetch('http://localhost:3001/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: invoice.client_phone,
            message: `Invoice ${invoice.invoice_number} is ready! Amount: $${invoice.total_amount.toFixed(2)}. Pay online: ${paymentLink}`
          })
        });
      }

      await api.invoices.update(invoice.id, { status: 'sent', sent_at: new Date().toISOString() });
      toast({ title: "Success", description: `Invoice sent via ${method}` });
      loadInvoices();
    } catch (error) {
      toast({ title: "Error", description: `Failed to send invoice via ${method}`, variant: "destructive" });
    }
  };

  const copyPaymentLink = (invoice: any) => {
    const link = `${window.location.origin}/invoice/${invoice.payment_link_id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Payment link copied to clipboard" });
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await api.invoices.delete(id);
      toast({ title: "Success", description: "Invoice deleted" });
      loadInvoices();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax = subtotal * (formData.tax_rate / 100);
    return subtotal + tax - formData.discount_amount;
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      booking_id: '',
      due_date: '',
      tax_rate: 0,
      discount_amount: 0,
      notes: '',
      terms: 'Payment due within 30 days',
      items: [{ description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-300';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Invoice Management</h2>
          <p className="text-gray-600 mt-1">Create and manage invoices</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary/90 font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No invoices yet. Create your first invoice to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{invoice.invoice_number}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{invoice.client?.name}</div>
                    <div className="text-sm text-gray-600">{invoice.client?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">${invoice.total?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700">{invoice.due_date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedInvoice(invoice); setShowViewModal(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice, 'email')}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSendInvoice(invoice, 'sms')}>
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copyPaymentLink(invoice)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <InvoiceCreateModal
          clients={clients}
          bookings={bookings}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateInvoice}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
          calculateTotal={calculateTotal}
        />
      )}

      {/* Invoice Preview Modal */}
      {showViewModal && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowViewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Invoice {selectedInvoice.invoice_number}
                </h1>
                <p className="text-gray-600">StoneRiver Junk Removal</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client & Date Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Bill To:</h3>
                <p className="font-bold text-gray-900">{selectedInvoice.client_name}</p>
                <p className="text-gray-600">{selectedInvoice.client_email}</p>
                {selectedInvoice.client_phone && <p className="text-gray-600">{selectedInvoice.client_phone}</p>}
                {selectedInvoice.client_address && <p className="text-gray-600 mt-1">{selectedInvoice.client_address}</p>}
              </div>
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Invoice Date:</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedInvoice.issue_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Due Date:</h3>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedInvoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border-t-2 border-gray-200 pt-6">
              <h3 className="text-lg font-black text-gray-900 mb-4">Services</h3>
              <div className="space-y-3">
                {selectedInvoice.items?.map((item: any) => (
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

            {/* Totals */}
            <div className="border-t-2 border-gray-200 mt-6 pt-6">
              <div className="space-y-2 max-w-md ml-auto">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-bold">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.tax_rate > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-semibold">Tax ({selectedInvoice.tax_rate}%):</span>
                    <span className="font-bold">${selectedInvoice.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-semibold">Discount:</span>
                    <span className="font-bold">-${selectedInvoice.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-300 pt-2 flex justify-between">
                  <span className="text-xl font-black text-gray-900">Total:</span>
                  <span className="text-2xl font-black text-primary">${selectedInvoice.total_amount.toFixed(2)}</span>
                </div>
                {selectedInvoice.amount_paid > 0 && (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-semibold">Amount Paid:</span>
                      <span className="font-bold">${selectedInvoice.amount_paid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-lg font-black text-gray-900">Balance Due:</span>
                      <span className="text-xl font-black text-orange-600">${selectedInvoice.balance_due.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Terms & Notes */}
            {selectedInvoice.terms && (
              <div className="border-t-2 border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Payment Terms:</h3>
                <p className="text-gray-700">{selectedInvoice.terms}</p>
              </div>
            )}

            {selectedInvoice.notes && (
              <div className="border-t-2 border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Notes:</h3>
                <p className="text-gray-700">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Payment Link */}
            {selectedInvoice.payment_link_id && (
              <div className="border-t-2 border-gray-200 mt-6 pt-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Payment Link:</h3>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/invoice/${selectedInvoice.payment_link_id}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyPaymentLink(selectedInvoice)}
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InvoicesManager;
