import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, Truck, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

interface BookingComposerProps {
  client: any;
  onClose: () => void;
}

const BookingComposer = ({ client, onClose }: BookingComposerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingData, setBookingData] = useState({
    serviceType: "residential",
    loadSize: "half",
    preferredDate: "",
    preferredTime: "",
    notes: ""
  });

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM",
  ];

  useEffect(() => {
    if (bookingData.preferredDate) {
      loadAvailableSlots(bookingData.preferredDate);
    }
  }, [bookingData.preferredDate]);

  const loadAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const result = await api.bookings.getAvailableSlots(date);
      setAvailableSlots(result.availableSlots);
      
      if (result.availableCount === 0) {
        toast({
          title: "No Availability",
          description: "All time slots are booked for this date. Please select a different date.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.bookings.create({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address || "",
        service_type: bookingData.serviceType,
        load_size: bookingData.loadSize,
        preferred_date: bookingData.preferredDate,
        preferred_time: bookingData.preferredTime,
        notes: bookingData.notes || null,
        status: 'pending',
      });

      toast({
        title: "Booking Created!",
        description: `Booking created for ${client.name} on ${bookingData.preferredDate} at ${bookingData.preferredTime}`,
      });

      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Error",
        description: error.message || "Failed to create booking. Please try a different time slot.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">Create Booking</h3>
              <p className="text-sm text-gray-600">Schedule service for {client.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase">Client</div>
              <div className="text-lg font-black text-gray-900">{client.name}</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-500 uppercase">Phone</div>
              <div className="text-lg font-black text-gray-900">{client.phone}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">
              Service Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "residential", label: "Residential", icon: "🏠" },
                { value: "commercial", label: "Commercial", icon: "🏢" },
                { value: "demolition", label: "Demolition", icon: "🔨" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setBookingData({ ...bookingData, serviceType: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    bookingData.serviceType === type.value
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{type.icon}</div>
                  <div className="font-bold text-sm text-gray-900">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Load Size */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase">
              Load Size
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: "quarter", label: "1/4", price: "$150" },
                { value: "half", label: "1/2", price: "$250" },
                { value: "threeQuarter", label: "3/4", price: "$350" },
                { value: "full", label: "Full", price: "$450" },
              ].map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setBookingData({ ...bookingData, loadSize: size.value })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    bookingData.loadSize === size.value
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Truck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <div className="font-bold text-xs text-gray-900">{size.label}</div>
                  <div className="text-purple-600 font-black text-sm">{size.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                Preferred Date *
              </label>
              <Input
                type="date"
                value={bookingData.preferredDate}
                onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
                Preferred Time * {loadingSlots && <span className="text-xs text-gray-500">(Loading...)</span>}
              </label>
              <select
                value={bookingData.preferredTime}
                onChange={(e) => setBookingData({ ...bookingData, preferredTime: e.target.value })}
                required
                disabled={!bookingData.preferredDate || loadingSlots}
                className="h-12 w-full rounded-md border border-input bg-background px-3 py-2 disabled:opacity-50"
              >
                <option value="">
                  {!bookingData.preferredDate 
                    ? "Select a date first" 
                    : loadingSlots 
                    ? "Loading..." 
                    : availableSlots.length === 0
                    ? "No slots available"
                    : "Select time slot"}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} ✓ Available
                  </option>
                ))}
              </select>
              {bookingData.preferredDate && availableSlots.length > 0 && (
                <p className="text-xs text-green-600 mt-1 font-semibold">
                  ✓ {availableSlots.length} slot{availableSlots.length !== 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">
              Notes (Optional)
            </label>
            <Textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              placeholder="Any special instructions or details..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !bookingData.preferredDate || !bookingData.preferredTime}
              className="flex-1 bg-purple-600 hover:bg-purple-700 font-bold h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Booking
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BookingComposer;
