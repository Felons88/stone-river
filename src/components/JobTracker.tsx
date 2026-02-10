import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, Truck, Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface JobTrackerProps {
  bookingId: string;
}

interface TrackingData {
  id: string;
  booking_id: string;
  driver_name: string;
  driver_phone: string;
  vehicle_info: string;
  status: 'scheduled' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  current_location?: { lat: number; lng: number; timestamp: string };
  estimated_arrival?: string;
  actual_arrival?: string;
  completion_time?: string;
  notes?: string;
}

const JobTracker = ({ bookingId }: JobTrackerProps) => {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracking();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel(`tracking-${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_tracking',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setTracking(payload.new as TrackingData);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  const loadTracking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_tracking')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setTracking(data);
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'scheduled', label: 'Scheduled', icon: Clock },
    { key: 'en_route', label: 'On the Way', icon: Truck },
    { key: 'arrived', label: 'Arrived', icon: MapPin },
    { key: 'in_progress', label: 'In Progress', icon: Navigation },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getCurrentStepIndex = () => {
    if (!tracking) return -1;
    return statusSteps.findIndex(step => step.key === tracking.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading tracking information...</p>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Tracking information will be available soon</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900">Track Your Service</h2>
        <div className={`px-4 py-2 rounded-full font-bold ${
          tracking.status === 'completed' ? 'bg-green-100 text-green-700' :
          tracking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {tracking.status.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="flex justify-between items-center">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-primary text-white scale-110' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  <StepIcon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold text-center ${
                  isCurrent ? 'text-primary' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Driver Info */}
      {tracking.driver_name && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-3">Your Driver</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{tracking.driver_name}</p>
                {tracking.vehicle_info && (
                  <p className="text-sm text-gray-600">{tracking.vehicle_info}</p>
                )}
              </div>
            </div>
            {tracking.driver_phone && (
              <Button
                onClick={() => window.location.href = `tel:${tracking.driver_phone}`}
                variant="outline"
                className="w-full font-bold"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Driver: {tracking.driver_phone}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ETA */}
      {tracking.estimated_arrival && tracking.status !== 'completed' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-bold text-gray-900">Estimated Arrival</p>
              <p className="text-lg font-black text-blue-600">
                {new Date(tracking.estimated_arrival).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Info */}
      {tracking.status === 'completed' && tracking.completion_time && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-bold text-gray-900">Service Completed</p>
              <p className="text-sm text-gray-600">
                Completed at {new Date(tracking.completion_time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {tracking.notes && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">Notes</p>
          <p className="text-gray-700">{tracking.notes}</p>
        </div>
      )}

      {/* Map Placeholder */}
      {tracking.current_location && tracking.status !== 'completed' && (
        <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Live map coming soon</p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(tracking.current_location.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
