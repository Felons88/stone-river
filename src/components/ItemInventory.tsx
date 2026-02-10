import { useState } from 'react';
import { Package, Trash2, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface ItemInventoryProps {
  bookingId: string;
  onSave?: () => void;
}

interface InventoryItem {
  item_name: string;
  category: string;
  quantity: number;
  volume_cubic_feet?: number;
  weight_lbs?: number;
  disposal_method: 'landfill' | 'recycle' | 'donate' | 'resell' | 'hazardous';
  disposal_location?: string;
  item_condition: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

const ItemInventory = ({ bookingId, onSave }: ItemInventoryProps) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState<InventoryItem>({
    item_name: '',
    category: 'furniture',
    quantity: 1,
    disposal_method: 'landfill',
    item_condition: 'fair',
  });
  const { toast } = useToast();

  const categories = ['furniture', 'appliances', 'electronics', 'construction', 'yard_waste', 'general', 'hazardous'];
  const disposalMethods = [
    { value: 'landfill', label: 'Landfill', icon: '🗑️' },
    { value: 'recycle', label: 'Recycle', icon: '♻️' },
    { value: 'donate', label: 'Donate', icon: '🎁' },
    { value: 'resell', label: 'Resell', icon: '💰' },
    { value: 'hazardous', label: 'Hazardous', icon: '⚠️' },
  ];
  const conditions = ['poor', 'fair', 'good', 'excellent'];

  const handleAddItem = () => {
    if (!newItem.item_name) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an item name',
        variant: 'destructive',
      });
      return;
    }

    setItems([...items, { ...newItem }]);
    setNewItem({
      item_name: '',
      category: 'furniture',
      quantity: 1,
      disposal_method: 'landfill',
      item_condition: 'fair',
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveInventory = async () => {
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    try {
      const itemsToInsert = items.map(item => ({
        ...item,
        booking_id: bookingId,
      }));

      const { error } = await supabase
        .from('job_items')
        .insert(itemsToInsert);

      if (error) throw error;

      toast({
        title: 'Inventory Saved',
        description: `${items.length} item(s) recorded`,
      });

      if (onSave) onSave();
      setItems([]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save inventory',
        variant: 'destructive',
      });
    }
  };

  const getTotalVolume = () => {
    return items.reduce((sum, item) => sum + ((item.volume_cubic_feet || 0) * item.quantity), 0);
  };

  const getTotalWeight = () => {
    return items.reduce((sum, item) => sum + ((item.weight_lbs || 0) * item.quantity), 0);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          Item Inventory
        </h2>
        {items.length > 0 && (
          <Button
            onClick={handleSaveInventory}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Inventory
          </Button>
        )}
      </div>

      {/* Add New Item Form */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="font-bold text-gray-900">Add Item</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            placeholder="Item Name *"
            value={newItem.item_name}
            onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
          />
          
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
            className="w-full p-2 border-2 border-gray-200 rounded-lg font-semibold"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
          />

          <select
            value={newItem.disposal_method}
            onChange={(e) => setNewItem({ ...newItem, disposal_method: e.target.value as any })}
            className="w-full p-2 border-2 border-gray-200 rounded-lg font-semibold"
          >
            {disposalMethods.map(method => (
              <option key={method.value} value={method.value}>
                {method.icon} {method.label}
              </option>
            ))}
          </select>

          <select
            value={newItem.item_condition}
            onChange={(e) => setNewItem({ ...newItem, item_condition: e.target.value as any })}
            className="w-full p-2 border-2 border-gray-200 rounded-lg font-semibold"
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>

          <Input
            type="number"
            placeholder="Volume (cu ft)"
            value={newItem.volume_cubic_feet || ''}
            onChange={(e) => setNewItem({ ...newItem, volume_cubic_feet: parseFloat(e.target.value) || undefined })}
          />

          <Input
            type="number"
            placeholder="Weight (lbs)"
            value={newItem.weight_lbs || ''}
            onChange={(e) => setNewItem({ ...newItem, weight_lbs: parseInt(e.target.value) || undefined })}
          />

          <Input
            placeholder="Disposal Location"
            value={newItem.disposal_location || ''}
            onChange={(e) => setNewItem({ ...newItem, disposal_location: e.target.value })}
          />
        </div>

        <textarea
          placeholder="Notes (optional)"
          value={newItem.notes || ''}
          onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
          className="w-full p-3 border-2 border-gray-200 rounded-lg"
          rows={2}
        />

        <Button
          onClick={handleAddItem}
          className="w-full bg-primary hover:bg-primary/90 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Items ({items.length})</h3>
          
          {items.map((item, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900">{item.item_name}</h4>
                  <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                    <div><span className="text-gray-600">Category:</span> <span className="font-semibold">{item.category}</span></div>
                    <div><span className="text-gray-600">Quantity:</span> <span className="font-semibold">{item.quantity}</span></div>
                    <div><span className="text-gray-600">Disposal:</span> <span className="font-semibold">{item.disposal_method}</span></div>
                    <div><span className="text-gray-600">Condition:</span> <span className="font-semibold">{item.item_condition}</span></div>
                    {item.volume_cubic_feet && (
                      <div><span className="text-gray-600">Volume:</span> <span className="font-semibold">{item.volume_cubic_feet} cu ft</span></div>
                    )}
                    {item.weight_lbs && (
                      <div><span className="text-gray-600">Weight:</span> <span className="font-semibold">{item.weight_lbs} lbs</span></div>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleRemoveItem(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className="bg-primary/10 rounded-xl p-4">
            <h4 className="font-bold text-gray-900 mb-2">Summary</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Items:</span>
                <span className="ml-2 font-black text-lg">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Volume:</span>
                <span className="ml-2 font-black text-lg">{getTotalVolume().toFixed(1)} cu ft</span>
              </div>
              <div>
                <span className="text-gray-600">Total Weight:</span>
                <span className="ml-2 font-black text-lg">{getTotalWeight()} lbs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemInventory;
