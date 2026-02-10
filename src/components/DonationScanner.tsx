import { useState } from 'react';
import { Camera, Upload, Loader2, CheckCircle, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface DonationScannerProps {
  onScanComplete?: (items: any[]) => void;
}

interface ScannedItem {
  name: string;
  category: string;
  estimated_value: number;
  quantity: number;
  condition: string;
}

const DonationScanner = ({ onScanComplete }: DonationScannerProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scanImage = async () => {
    if (!image) return;

    setScanning(true);
    try {
      // Upload image to Supabase Storage
      const fileName = `donation-scan-${Date.now()}.${image.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('jobs')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jobs')
        .getPublicUrl(fileName);

      // TODO: Call AI vision API (OpenAI GPT-4 Vision, Google Cloud Vision, or AWS Rekognition)
      // For now, simulate AI scanning with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockScannedItems: ScannedItem[] = [
        { name: 'Sofa', category: 'furniture', estimated_value: 150, quantity: 1, condition: 'good' },
        { name: 'Coffee Table', category: 'furniture', estimated_value: 75, quantity: 1, condition: 'fair' },
        { name: 'Lamp', category: 'household', estimated_value: 25, quantity: 2, condition: 'good' },
        { name: 'Books', category: 'household', estimated_value: 30, quantity: 1, condition: 'good' },
      ];

      const total = mockScannedItems.reduce((sum, item) => sum + (item.estimated_value * item.quantity), 0);

      setScannedItems(mockScannedItems);
      setTotalValue(total);

      // Save to database
      const donationRecord = {
        image_url: publicUrl,
        scanned_items: mockScannedItems,
        total_estimated_value: total,
        scan_date: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from('donation_scans')
        .insert([donationRecord]);

      if (dbError) console.error('Error saving scan:', dbError);

      toast({
        title: 'Scan Complete!',
        description: `Found ${mockScannedItems.length} items worth $${total}`,
      });

      if (onScanComplete) onScanComplete(mockScannedItems);

    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to scan image',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleSaveDonation = async () => {
    if (scannedItems.length === 0) return;

    try {
      // Save each item as a disposal log
      const disposalLogs = scannedItems.map(item => ({
        item_category: item.category,
        quantity: item.quantity,
        weight_lbs: 0, // Could estimate based on item type
        disposal_method: 'donate',
        estimated_value: item.estimated_value,
        item_name: item.name,
        item_condition: item.condition,
      }));

      const { error } = await supabase
        .from('disposal_logs')
        .insert(disposalLogs);

      if (error) throw error;

      toast({
        title: 'Donation Saved!',
        description: `${scannedItems.length} items recorded for tax purposes`,
      });

      // Reset
      setImage(null);
      setPreview(null);
      setScannedItems([]);
      setTotalValue(0);

    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save donation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          AI Donation Scanner
        </h2>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
        <p className="text-gray-700 mb-4">
          <strong>📸 Take a photo of your donation items</strong> and our AI will automatically identify them and estimate their tax-deductible value!
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Instant item recognition</li>
          <li>✅ Automatic value estimation</li>
          <li>✅ Tax deduction tracking</li>
          <li>✅ Environmental impact calculation</li>
        </ul>
      </div>

      {/* Image Upload */}
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id="donation-image"
          />
          <label htmlFor="donation-image" className="cursor-pointer">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-900 mb-2">Upload Donation Photo</p>
            <p className="text-sm text-gray-600">Click to select or drag & drop</p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Donation preview"
              className="w-full h-96 object-cover rounded-xl"
            />
            <Button
              onClick={() => {
                setImage(null);
                setPreview(null);
                setScannedItems([]);
              }}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white"
            >
              Change Photo
            </Button>
          </div>

          {scannedItems.length === 0 && (
            <Button
              onClick={scanImage}
              disabled={scanning}
              className="w-full bg-primary hover:bg-primary/90 font-bold text-lg py-6"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scanning with AI...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Scan Items
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Scanned Results */}
      {scannedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold text-gray-900">Scan Complete!</p>
                <p className="text-sm text-gray-600">Found {scannedItems.length} items</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Estimated Value</p>
              <p className="text-3xl font-black text-green-600">${totalValue}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Identified Items:</h3>
            {scannedItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.category} • {item.condition} • Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900">${item.estimated_value * item.quantity}</p>
                  <p className="text-xs text-gray-500">${item.estimated_value} each</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSaveDonation}
            className="w-full bg-green-600 hover:bg-green-700 font-bold text-lg py-6"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Save Donation for Tax Records
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 Tax Tip:</strong> Keep this record for your tax deductions! Donations to qualified charities are tax-deductible. Consult your tax advisor for details.
        </p>
      </div>
    </div>
  );
};

export default DonationScanner;
