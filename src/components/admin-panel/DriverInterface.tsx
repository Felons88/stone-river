import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface DriverInterfaceProps {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  destination: string;
}

const DriverInterface = ({ bookingId, customerName, customerEmail, destination }: DriverInterfaceProps) => {
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackingLocation, setTrackingLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Request location permission on mount
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          toast({
            title: 'Location Access Denied',
            description: 'Please enable location services to use driver features',
            variant: 'destructive',
          });
        }
      );
    }
  }, []);

  const calculateETA = async () => {
    if (!driverLocation) {
      toast({
        title: 'Location Required',
        description: 'Please enable location services',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Call Google Maps Distance Matrix API via backend
      const response = await fetch('http://localhost:3001/api/maps/calculate-eta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: `${driverLocation.lat},${driverLocation.lng}`,
          destination: destination,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEta(data.duration_text);
        setDistance(data.distance_text);
        return {
          eta: data.duration_text,
          distance: data.distance_text,
          duration_minutes: data.duration_value / 60,
        };
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'ETA Calculation Failed',
        description: error.message || 'Could not calculate route',
        variant: 'destructive',
      });
      return null;
    }
  };

  const sendOnTheWayNotification = async () => {
    setLoading(true);
    try {
      const etaData = await calculateETA();
      
      if (!etaData) {
        setLoading(false);
        return;
      }

      // Get driver info from localStorage or prompt
      let driverName = localStorage.getItem('driverName');
      let driverPhone = localStorage.getItem('driverPhone');

      // Prompt for driver info if not set
      if (!driverName) {
        driverName = prompt('Enter driver name:') || 'Your StoneRiver Team';
        if (driverName !== 'Your StoneRiver Team') {
          localStorage.setItem('driverName', driverName);
        }
      }

      if (!driverPhone) {
        driverPhone = prompt('Enter driver phone number:') || '(612) 685-4696';
        if (driverPhone !== '(612) 685-4696') {
          localStorage.setItem('driverPhone', driverPhone);
        }
      }

      // Send email via backend
      const response = await fetch('http://localhost:3001/api/email/on-the-way', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          driver_name: driverName,
          driver_phone: driverPhone,
          eta: etaData.eta,
          distance: etaData.distance,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Customer Notified!',
          description: `"On the way" email sent to ${customerName}`,
        });

        // Update booking status
        await supabase
          .from('bookings')
          .update({ 
            status: 'in_progress',
            driver_location: `${driverLocation.lat},${driverLocation.lng}`,
            eta_sent_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Send',
        description: error.message || 'Could not send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRunningLateNotification = async () => {
    setLoading(true);
    try {
      const etaData = await calculateETA();
      
      if (!etaData) {
        setLoading(false);
        return;
      }

      const delayMinutes = Math.ceil(etaData.duration_minutes);
      const newEta = new Date(Date.now() + delayMinutes * 60000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const response = await fetch('http://localhost:3001/api/email/running-late', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          delay_minutes: delayMinutes,
          reason: 'traffic conditions',
          new_eta: newEta,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Customer Notified',
          description: `Running late notification sent`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Send',
        description: error.message || 'Could not send notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      setTrackingLocation(true);
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          
          // Auto-update ETA every location change
          calculateETA();
        },
        (error) => {
          console.error('Location tracking error:', error);
          setTrackingLocation(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );

      // Store watch ID to stop later
      return () => navigator.geolocation.clearWatch(watchId);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-primary/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-black text-gray-900">Driver Controls</h3>
      </div>

      {/* Location Status */}
      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${driverLocation ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="font-bold text-sm">
              {driverLocation ? 'Location Active' : 'Location Disabled'}
            </span>
          </div>
          {!trackingLocation && driverLocation && (
            <Button
              onClick={startLocationTracking}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Enable Live Tracking
            </Button>
          )}
        </div>

        {driverLocation && (
          <div className="text-xs text-gray-600 space-y-1">
            <div>📍 Lat: {driverLocation.lat.toFixed(6)}</div>
            <div>📍 Lng: {driverLocation.lng.toFixed(6)}</div>
          </div>
        )}
      </div>

      {/* ETA Display */}
      {eta && distance && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-bold">Current ETA</span>
          </div>
          <div className="text-2xl font-black text-primary">{eta}</div>
          <div className="text-sm text-gray-600">{distance} away</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={sendOnTheWayNotification}
          disabled={loading || !driverLocation}
          className="w-full bg-green-600 hover:bg-green-700 font-bold text-lg py-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send "On The Way" Email
            </>
          )}
        </Button>

        <Button
          onClick={sendRunningLateNotification}
          disabled={loading || !driverLocation}
          variant="outline"
          className="w-full font-bold border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              Send "Running Late" Email
            </>
          )}
        </Button>

        <Button
          onClick={calculateETA}
          disabled={loading || !driverLocation}
          variant="outline"
          className="w-full font-bold"
        >
          <Clock className="w-5 h-5 mr-2" />
          Refresh ETA
        </Button>
      </div>

      {!driverLocation && (
        <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold">
            ⚠️ Enable location services to use driver features
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverInterface;
