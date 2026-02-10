import { motion } from "framer-motion";
import { X, Plus, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceCreateModalProps {
  clients: any[];
  bookings: any[];
  formData: any;
  setFormData: (data: any) => void;
  onClose: () => void;
  onCreate: () => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: string, value: any) => void;
  calculateTotal: () => number;
}

const InvoiceCreateModal = ({
  clients,
  bookings,
  formData,
  setFormData,
  onClose,
  onCreate,
  addItem,
  removeItem,
  updateItem,
  calculateTotal
}: InvoiceCreateModalProps) => {
  const subtotal = formData.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * (formData.tax_rate / 100);
  const total = calculateTotal();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Create Invoice</h3>
              <p className="text-sm text-gray-600">Generate a new invoice for a client</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Client & Booking Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                required
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Related Booking (Optional)</label>
              <select
                value={formData.booking_id}
                onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                className="w-full h-12 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">No Booking</option>
                {bookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.name} - {booking.preferred_date} {booking.preferred_time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Due Date *</label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-gray-700 uppercase">Line Items *</label>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                    {formData.items.length > 1 && (
                      <Button
                        onClick={() => removeItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Discount */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Tax Rate (%)</label>
              <Input
                type="number"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Discount Amount ($)</label>
              <Input
                type="number"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Subtotal:</span>
                <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-700">Tax ({formData.tax_rate}%):</span>
                <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
              </div>
              {formData.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Discount:</span>
                  <span className="font-bold text-red-600">-${formData.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-green-300 pt-2 flex justify-between">
                <span className="font-black text-gray-900 text-lg">TOTAL:</span>
                <span className="font-black text-green-600 text-2xl">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Notes (Optional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this invoice..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Payment Terms</label>
              <Textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Payment terms and conditions..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              onClick={onCreate}
              disabled={!formData.client_id || !formData.due_date || formData.items.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-12"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Create Invoice
            </Button>
            <Button onClick={onClose} variant="outline" className="font-bold">
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoiceCreateModal;
