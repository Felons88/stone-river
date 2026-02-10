import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Calculator, Truck, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  getAllPricingItems,
  calculatePrice,
  formatLoadSize,
  getLoadPercentage,
  saveQuoteRequest,
  type PricingItem,
  type SelectedItem,
} from '@/lib/pricing-engine';

const PricingCalculator = () => {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const { toast } = useToast();

  const categories = [
    { key: 'all', label: 'All Items', icon: Package },
    { key: 'furniture', label: 'Furniture', icon: '🛋️' },
    { key: 'appliances', label: 'Appliances', icon: '🔌' },
    { key: 'electronics', label: 'Electronics', icon: '📺' },
    { key: 'construction', label: 'Construction', icon: '🔨' },
    { key: 'yard_waste', label: 'Yard Waste', icon: '🌿' },
  ];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await getAllPricingItems();
    setItems(data);
    setLoading(false);
  };

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  const addItem = (item: PricingItem) => {
    const existing = selectedItems.find(si => si.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.map(si =>
        si.id === item.id ? { ...si, quantity: si.quantity + 1 } : si
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setSelectedItems(selectedItems.map(si =>
        si.id === itemId ? { ...si, quantity } : si
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(si => si.id !== itemId));
  };

  const priceBreakdown = calculatePrice(selectedItems);
  const loadPercentage = getLoadPercentage(priceBreakdown.estimated_volume);

  const handleSaveQuote = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const result = await saveQuoteRequest(
      customerInfo.name,
      customerInfo.email,
      customerInfo.phone,
      customerInfo.address,
      selectedItems,
      priceBreakdown,
      customerInfo.notes
    );

    if (result.success) {
      toast({
        title: 'Quote Saved!',
        description: "We'll contact you shortly with your personalized quote.",
      });
      setShowQuoteForm(false);
      setCustomerInfo({ name: '', email: '', phone: '', address: '', notes: '' });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save quote',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          <Calculator className="inline-block w-10 h-10 mr-3 text-primary" />
          Instant Price Calculator
        </h1>
        <p className="text-lg text-gray-600">
          Select items to get an instant estimate. No hidden fees!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Item Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.key
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {typeof cat.icon === 'string' ? (
                    <span className="text-xl">{cat.icon}</span>
                  ) : (
                    <cat.icon className="w-5 h-5" />
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500">No items in this category</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-primary transition-all cursor-pointer"
                  onClick={() => addItem(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{item.item_name}</h3>
                    <span className="text-primary font-black text-lg">
                      ${item.base_price.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📦 {item.volume_cubic_feet} cu ft</p>
                    <p>⚖️ ~{item.weight_estimate_lbs} lbs</p>
                    {item.requires_special_handling && (
                      <p className="text-orange-600 font-semibold">⚠️ Special handling</p>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(item);
                    }}
                    className="w-full mt-3 bg-primary hover:bg-primary/90 font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-6">
          {/* Truck Visualization */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary" />
              Truck Load
            </h3>
            <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden mb-4">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-orange-500 transition-all duration-500"
                style={{ height: `${loadPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-gray-900 drop-shadow-lg">
                  {loadPercentage}%
                </span>
              </div>
            </div>
            <p className="text-center font-bold text-gray-700">
              {formatLoadSize(priceBreakdown.load_size)}
            </p>
            <p className="text-center text-sm text-gray-500 mt-2">
              {priceBreakdown.estimated_volume.toFixed(0)} cubic feet
            </p>
          </div>

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <h3 className="font-black text-gray-900 mb-4">Selected Items</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.item_name}</p>
                      <p className="text-xs text-gray-500">
                        ${item.base_price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-primary to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Price Estimate
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">${priceBreakdown.subtotal.toFixed(2)}</span>
              </div>
              {priceBreakdown.disposal_fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Disposal Fees:</span>
                  <span className="font-bold">${priceBreakdown.disposal_fees.toFixed(2)}</span>
                </div>
              )}
              {priceBreakdown.special_handling_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Special Handling:</span>
                  <span className="font-bold">${priceBreakdown.special_handling_fee.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-white/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black">Total:</span>
                <span className="text-4xl font-black">${priceBreakdown.total.toFixed(2)}</span>
              </div>
            </div>
            {selectedItems.length > 0 && (
              <Button
                onClick={() => setShowQuoteForm(true)}
                className="w-full mt-4 bg-white text-primary hover:bg-gray-100 font-black text-lg py-6"
              >
                Get This Quote
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black mb-4">Get Your Quote</h3>
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
                type="tel"
                placeholder="Phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              />
              <Input
                placeholder="Service Address *"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              />
              <textarea
                placeholder="Additional notes..."
                value={customerInfo.notes}
                onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg"
                rows={3}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowQuoteForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveQuote}
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                >
                  Submit Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;
