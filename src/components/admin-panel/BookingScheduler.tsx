import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Plus, Edit, Trash2, CheckCircle, XCircle, Eye, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api-client";
import DriverInterface from "./DriverInterface";

const BookingScheduler = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'Junk Removal',
    load_size: '1/4 Truck',
    preferred_date: '',
    preferred_time: '',
    service_address: '',
    city: '',
    state: 'MN',
    zip: '',
    notes: '',
    status: 'pending',
  });

  useEffect(() => {
    loadBookings();
    loadClients();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.getAll();
      const allBookings = data || [];
      
      // Filter today's bookings
      const today = new Date().toISOString().split('T')[0];
      const todaysBookings = allBookings.filter(
        (b: any) => b.preferred_date === today && b.status !== 'completed' && b.status !== 'cancelled'
      );
      
      setBookings(allBookings);
      setTodayBookings(todaysBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
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

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'new') {
      // Clear form for new customer
      setFormData({
        ...formData,
        name: '',
        email: '',
        phone: '',
        service_address: '',
        city: '',
        zip: '',
      });
    } else {
      // Auto-fill from selected client
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setFormData({
          ...formData,
          name: client.name || '',
          email: client.email || '',
          phone: client.phone || '',
          service_address: client.address || '',
          city: client.city || '',
          zip: client.zip || '',
        });
      }
    }
  };

  const toggleBooking = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const handleCreateBooking = async () => {
    try {
      // Map service_address to address for database compatibility
      const bookingData = {
        ...formData,
        address: formData.service_address || '',
      };
      await api.bookings.create(bookingData);
      toast({ title: 'Success', description: 'Booking created successfully' });
      setShowCreateModal(false);
      loadBookings();
      resetForm();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create booking', variant: 'destructive' });
    }
  };

  const handleUpdateBooking = async () => {
    try {
      await api.bookings.update(selectedBooking.id, formData);
      toast({ title: 'Success', description: 'Booking updated successfully' });
      setShowDetailsModal(false);
      loadBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update booking', variant: 'destructive' });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.bookings.delete(bookingId);
      toast({ title: 'Success', description: 'Booking deleted successfully' });
      loadBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete booking', variant: 'destructive' });
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.bookings.update(bookingId, { status: newStatus });
      
      // Auto-send confirmation email when status changes to confirmed
      if (newStatus === 'confirmed') {
        console.log('📧 Attempting to send confirmation email for booking:', bookingId);
        try {
          const response = await fetch('http://localhost:3001/api/email/booking-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId }),
          });
          
          console.log('📧 Email API response status:', response.status);
          const responseData = await response.json();
          console.log('📧 Email API response data:', responseData);
          
          if (response.ok && responseData.success) {
            toast({ title: 'Success', description: 'Booking confirmed and email sent!' });
          } else {
            console.error('❌ Email failed:', responseData);
            toast({ 
              title: 'Warning', 
              description: `Booking confirmed but email failed: ${responseData.error || 'Unknown error'}`,
              variant: 'destructive'
            });
          }
        } catch (emailError: any) {
          console.error('❌ Email error:', emailError);
          toast({ 
            title: 'Warning', 
            description: `Booking confirmed but email failed: ${emailError.message || 'Server not reachable'}`,
            variant: 'destructive'
          });
        }
      }
      
      // Auto-send job completion email when status changes to completed
      else if (newStatus === 'completed') {
        console.log('🎉 Attempting to send job completion email for booking:', bookingId);
        try {
          const response = await fetch('http://localhost:3001/api/email/job-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: bookingId }),
          });
          
          console.log('🎉 Job completion email API response status:', response.status);
          const responseData = await response.json();
          console.log('🎉 Job completion email API response data:', responseData);
          
          if (response.ok && responseData.success) {
            toast({ title: 'Success', description: 'Job completed and notification email sent!' });
          } else {
            console.error('❌ Job completion email failed:', responseData);
            toast({ 
              title: 'Warning', 
              description: `Job completed but email failed: ${responseData.error || 'Unknown error'}`,
              variant: 'destructive'
            });
          }
        } catch (emailError: any) {
          console.error('❌ Job completion email error:', emailError);
          toast({ 
            title: 'Warning', 
            description: `Job completed but email failed: ${emailError.message || 'Server not reachable'}`,
            variant: 'destructive'
          });
        }
      }
      
      else {
        toast({ title: 'Success', description: `Booking ${newStatus}` });
      }
      
      loadBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setFormData({
      name: booking.name || '',
      email: booking.email || '',
      phone: booking.phone || '',
      service_type: booking.service_type || 'Junk Removal',
      load_size: booking.load_size || '1/4 Truck',
      preferred_date: booking.preferred_date || '',
      preferred_time: booking.preferred_time || '',
      service_address: booking.service_address || booking.address || '',
      city: booking.city || '',
      state: booking.state || 'MN',
      zip: booking.zip || '',
      notes: booking.notes || '',
      status: booking.status || 'pending',
    });
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      service_type: 'Junk Removal',
      load_size: '1/4 Truck',
      preferred_date: '',
      preferred_time: '',
      service_address: '',
      city: '',
      state: 'MN',
      zip: '',
      notes: '',
      status: 'pending',
    });
    setSelectedBooking(null);
    setSelectedClientId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Bookings & Scheduling</h2>
          <p className="text-gray-600 mt-1">Manage bookings with real-time location tracking</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Booking
        </Button>
      </div>

      {/* Today's Bookings - Driver View */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border-2 border-primary/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black text-gray-900">Today's Schedule</h3>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary">{todayBookings.length}</div>
            <div className="text-sm text-gray-600">Active Jobs</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading today's bookings...</div>
        ) : todayBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">No bookings scheduled for today</p>
            <p className="text-sm text-gray-400 mt-2">Check back tomorrow or view all bookings below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todayBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                {/* Booking Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleBooking(booking.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                        {booking.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-lg text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-600 font-semibold">{booking.service_type} - {booking.load_size}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1 font-semibold">
                            <Clock className="w-4 h-4" />
                            {booking.preferred_time || 'TBD'}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-4 h-4" />
                            {booking.service_address || booking.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(booking); }}
                        size="sm"
                        variant="outline"
                        className="font-bold"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => { handleStatusChange(booking.id, value); }}
                      >
                        <SelectTrigger className="w-32 font-bold" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedBooking === booking.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Interface - Expanded */}
                {expandedBooking === booking.id && (
                  <div className="border-t-2 border-gray-200 p-6 bg-gray-50">
                    <DriverInterface
                      bookingId={booking.id}
                      customerName={booking.name}
                      customerEmail={booking.email}
                      destination={booking.service_address || booking.address}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Bookings - Compact View */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4">All Upcoming Bookings</h3>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No bookings found</div>
        ) : (
          <div className="space-y-3">
            {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').slice(0, 10).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => handleViewDetails(booking)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {booking.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{booking.name}</div>
                    <div className="text-xs text-gray-600">{booking.service_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900">{booking.preferred_date}</div>
                    <div className="text-xs text-gray-500">{booking.preferred_time || 'TBD'}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking.id); }}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Booking Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Client *</Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose existing client or create new" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">➕ New Customer (Manual Entry)</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="John Doe"
                  disabled={selectedClientId !== 'new' && selectedClientId !== ''}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="john@example.com"
                  disabled={selectedClientId !== 'new' && selectedClientId !== ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="(612) 555-1234"
                  disabled={selectedClientId !== 'new' && selectedClientId !== ''}
                />
              </div>
              <div>
                <Label>Service Type</Label>
                <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junk Removal">Junk Removal</SelectItem>
                    <SelectItem value="Furniture Removal">Furniture Removal</SelectItem>
                    <SelectItem value="Appliance Removal">Appliance Removal</SelectItem>
                    <SelectItem value="Yard Waste">Yard Waste</SelectItem>
                    <SelectItem value="Construction Debris">Construction Debris</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Load Size</Label>
                <Select value={formData.load_size} onValueChange={(value) => setFormData({...formData, load_size: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1/4 Truck">1/4 Truck</SelectItem>
                    <SelectItem value="1/2 Truck">1/2 Truck</SelectItem>
                    <SelectItem value="3/4 Truck">3/4 Truck</SelectItem>
                    <SelectItem value="Full Truck">Full Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred Date *</Label>
                <Input type="date" value={formData.preferred_date} onChange={(e) => setFormData({...formData, preferred_date: e.target.value})} />
              </div>
              <div>
                <Label>Preferred Time</Label>
                <Input type="time" value={formData.preferred_time} onChange={(e) => setFormData({...formData, preferred_time: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Service Address *</Label>
              <Input value={formData.service_address} onChange={(e) => setFormData({...formData, service_address: e.target.value})} placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Minneapolis" />
              </div>
              <div>
                <Label>State</Label>
                <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="MN" />
              </div>
              <div>
                <Label>ZIP</Label>
                <Input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} placeholder="55401" />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Additional details..." rows={3} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleCreateBooking} className="bg-primary hover:bg-primary/90 font-bold">Create Booking</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex gap-2">
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    <Button size="sm" variant="outline" onClick={() => window.location.href = `mailto:${formData.email}`}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <div className="flex gap-2">
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    <Button size="sm" variant="outline" onClick={() => window.location.href = `tel:${formData.phone}`}>
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Service Type</Label>
                  <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junk Removal">Junk Removal</SelectItem>
                      <SelectItem value="Furniture Removal">Furniture Removal</SelectItem>
                      <SelectItem value="Appliance Removal">Appliance Removal</SelectItem>
                      <SelectItem value="Yard Waste">Yard Waste</SelectItem>
                      <SelectItem value="Construction Debris">Construction Debris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Load Size</Label>
                  <Select value={formData.load_size} onValueChange={(value) => setFormData({...formData, load_size: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1/4 Truck">1/4 Truck</SelectItem>
                      <SelectItem value="1/2 Truck">1/2 Truck</SelectItem>
                      <SelectItem value="3/4 Truck">3/4 Truck</SelectItem>
                      <SelectItem value="Full Truck">Full Truck</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Date</Label>
                  <Input type="date" value={formData.preferred_date} onChange={(e) => setFormData({...formData, preferred_date: e.target.value})} />
                </div>
                <div>
                  <Label>Preferred Time</Label>
                  <Input type="time" value={formData.preferred_time} onChange={(e) => setFormData({...formData, preferred_time: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Service Address</Label>
                <Input value={formData.service_address} onChange={(e) => setFormData({...formData, service_address: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setShowDetailsModal(false); resetForm(); }}>Cancel</Button>
                <Button variant="destructive" onClick={() => { handleDeleteBooking(selectedBooking.id); setShowDetailsModal(false); }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleUpdateBooking} className="bg-primary hover:bg-primary/90 font-bold">Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingScheduler;
