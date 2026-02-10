import { useState, useEffect } from "react";
import { Calendar, Search, Filter, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

const BookingsManager = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.bookings.getAll();
      setBookings(data || []);
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

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.bookings.updateStatus(id, status);
      await loadBookings();
      toast({
        title: "Success",
        description: `Booking ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Bookings Management</h2>
          <p className="text-gray-600 mt-1">Manage all service appointments</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-bold">
          <Calendar className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Customer</th>
              <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Service</th>
              <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Date & Time</th>
              <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{booking.name}</div>
                  <div className="text-sm text-gray-600">{booking.email}</div>
                  <div className="text-sm text-gray-600">{booking.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 capitalize">{booking.service_type}</div>
                  <div className="text-sm text-gray-600 capitalize">{booking.load_size} truck</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{booking.preferred_date}</div>
                  <div className="text-sm text-gray-600">{booking.preferred_time}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(booking.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsManager;
