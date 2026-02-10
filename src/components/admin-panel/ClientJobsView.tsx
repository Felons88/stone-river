import { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Image, Plus, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import PhotoUpload from '@/components/PhotoUpload';
import JobTracker from '@/components/JobTracker';

interface ClientJobsViewProps {
  clientEmail: string;
  clientName: string;
  onViewAsCustomer?: () => void;
}

const ClientJobsView = ({ clientEmail, clientName, onViewAsCustomer }: ClientJobsViewProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, [clientEmail]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', clientEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhotos = (booking: any) => {
    setSelectedBooking(booking);
    setShowPhotoUpload(true);
  };

  const handleViewTracking = (booking: any) => {
    setSelectedBooking(booking);
    setShowTracking(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Jobs for {clientName}</h3>
          <p className="text-gray-600">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        {onViewAsCustomer && (
          <Button
            onClick={onViewAsCustomer}
            variant="outline"
            className="font-bold"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View as Customer
          </Button>
        )}
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">Add Photos</h3>
              <Button
                onClick={() => {
                  setShowPhotoUpload(false);
                  setSelectedBooking(null);
                }}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <PhotoUpload
              bookingId={selectedBooking.id}
              photoType="during"
              maxFiles={10}
              onUploadComplete={() => {
                toast({
                  title: 'Photos Uploaded',
                  description: 'Photos have been added to this job',
                });
                setShowPhotoUpload(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Job Tracking Modal */}
      {showTracking && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">Job Tracking</h3>
              <Button
                onClick={() => {
                  setShowTracking(false);
                  setSelectedBooking(null);
                }}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <JobTracker bookingId={selectedBooking.id} />
          </div>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found for this client</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-black text-gray-900">{booking.service_type}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.preferred_date} {booking.preferred_time && `at ${booking.preferred_time}`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{booking.service_address}</span>
                    </div>
                    {booking.estimated_price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">${booking.estimated_price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t-2 border-gray-100">
                <Button
                  onClick={() => handleAddPhotos(booking)}
                  variant="outline"
                  size="sm"
                  className="font-bold"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
                <Button
                  onClick={() => handleViewTracking(booking)}
                  variant="outline"
                  size="sm"
                  className="font-bold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Tracking
                </Button>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700"><strong>Notes:</strong> {booking.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientJobsView;
