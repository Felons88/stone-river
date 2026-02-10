import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, Mail, Phone, MapPin, MessageSquare, Calendar, X, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";
import { motion } from "framer-motion";
import SMSComposer from "./SMSComposer";
import EnhancedEmailComposer from "./EnhancedEmailComposer";
import BookingComposer from "./BookingComposer";
import ClientJobsView from "./ClientJobsView";

const ClientsManager = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSMSComposer, setShowSMSComposer] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showBookingComposer, setShowBookingComposer] = useState(false);
  const [showJobsView, setShowJobsView] = useState(false);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "MN",
    zip_code: "",
    company_name: "",
    client_type: "residential",
    notes: ""
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await api.clients.getAll();
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadClients();
      return;
    }
    try {
      const data = await api.clients.search(searchTerm);
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await api.clients.update(editingClient.id, formData);
        toast({ title: "Success", description: "Client updated successfully" });
      } else {
        await api.clients.create(formData);
        toast({ title: "Success", description: "Client created successfully" });
      }
      setShowForm(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save client",
        variant: "destructive",
      });
    }
  };

  const handleView = async (client: any) => {
    // Load client's invoices to show accurate stats
    try {
      const invoices = await api.invoices.getAll();
      const clientInvoices = invoices?.filter((inv: any) => inv.client_email === client.email) || [];
      
      const totalSpent = clientInvoices
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      
      const pastDue = clientInvoices
        .filter((inv: any) => inv.status === 'overdue' || inv.status === 'pending')
        .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
      
      const bookings = await api.bookings.getAll();
      const clientBookings = bookings?.filter((b: any) => b.email === client.email) || [];
      
      setViewingClient({
        ...client,
        total_jobs: clientBookings.length,
        total_spent: totalSpent,
        total_invoices: clientInvoices.length,
        past_due: pastDue,
      });
    } catch (error) {
      console.error('Error loading client stats:', error);
      setViewingClient(client);
    }
    setShowViewModal(true);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "MN",
      zip_code: client.zip_code || "",
      company_name: client.company_name || "",
      client_type: client.client_type || "residential",
      notes: client.notes || ""
    });
    setShowForm(true);
  };

  const handleSendSMS = (client: any) => {
    setSelectedClient(client);
    setShowSMSComposer(true);
  };

  const handleSendEmail = (client: any) => {
    setSelectedClient(client);
    setShowEmailComposer(true);
  };

  const handleCreateBooking = (client: any) => {
    setSelectedClient(client);
    setShowViewModal(false);
    setShowBookingComposer(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await api.clients.delete(id);
      toast({ title: "Success", description: "Client deleted successfully" });
      loadClients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "MN",
      zip_code: "",
      company_name: "",
      client_type: "residential",
      notes: ""
    });
  };

  const filteredClients = searchTerm
    ? clients
    : clients;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Client Management</h2>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingClient(null); resetForm(); }}
          className="bg-primary hover:bg-primary/90 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="font-bold">
          Search
        </Button>
      </div>

      {/* Client Quick View Modal */}
      {showViewModal && viewingClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowViewModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Client Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info Grid */}
            <div className="space-y-6">
              {/* Name & Type */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase mb-1">Name</div>
                  <div className="text-2xl font-black text-gray-900">{viewingClient.name}</div>
                  {viewingClient.company_name && (
                    <div className="text-sm text-gray-600 mt-1">{viewingClient.company_name}</div>
                  )}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  viewingClient.client_type === 'commercial' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {viewingClient.client_type}
                </span>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase mb-2">Email</div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {viewingClient.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase mb-2">Phone</div>
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {viewingClient.phone}
                  </div>
                </div>
              </div>

              {/* Address */}
              {viewingClient.address && (
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase mb-2">Address</div>
                  <div className="flex items-start gap-2 text-gray-900 font-semibold">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <div>{viewingClient.address}</div>
                      {(viewingClient.city || viewingClient.state || viewingClient.zip_code) && (
                        <div className="text-gray-600">
                          {viewingClient.city && `${viewingClient.city}, `}
                          {viewingClient.state} {viewingClient.zip_code}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingClient.notes && (
                <div>
                  <div className="text-sm font-bold text-gray-500 uppercase mb-2">Notes</div>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {viewingClient.notes}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t-2 border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-black text-gray-900">{viewingClient.total_jobs || 0}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Total Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-600">{viewingClient.total_invoices || 0}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Invoices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-600">${viewingClient.total_spent?.toFixed(2) || '0.00'}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Total Paid</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-black ${viewingClient.past_due > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    ${viewingClient.past_due?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase">Past Due</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t-2 border-gray-100">
                <div className="text-sm font-bold text-gray-500 uppercase mb-3">Quick Actions</div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowJobsView(true);
                    }}
                    className="bg-primary hover:bg-primary/90 font-bold"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    View Jobs & Photos
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:3001/api/portal/create-account', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: viewingClient.email,
                            name: viewingClient.name,
                            phone: viewingClient.phone,
                          }),
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          toast({
                            title: 'Portal Account Created!',
                            description: `Credentials sent to ${viewingClient.email}`,
                          });
                        } else {
                          toast({
                            title: 'Error',
                            description: result.error || 'Failed to create account',
                            variant: 'destructive',
                          });
                        }
                      } catch (error: any) {
                        toast({
                          title: 'Error',
                          description: error.message || 'Failed to create account',
                          variant: 'destructive',
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700 font-bold"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create Portal
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleSendSMS(viewingClient)}
                    className="bg-green-600 hover:bg-green-700 font-bold"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    onClick={() => handleSendEmail(viewingClient)}
                    className="bg-blue-600 hover:bg-blue-700 font-bold"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    onClick={() => handleCreateBooking(viewingClient)}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Booking
                  </Button>
                </div>
              </div>

              {/* Edit & Close Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(viewingClient);
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Client
                </Button>
                <Button
                  onClick={() => setShowViewModal(false)}
                  variant="outline"
                  className="font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(612) 555-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Client Type *</label>
                  <select
                    required
                    value={formData.client_type}
                    onChange={(e) => setFormData({...formData, client_type: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="St. Cloud"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    placeholder="MN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    placeholder="56301"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-medium"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 font-bold">
                  {editingClient ? 'Update Client' : 'Create Client'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setShowForm(false); setEditingClient(null); }}
                  className="font-bold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No clients found. Click "Add Client" to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{client.name}</div>
                    {client.company_name && (
                      <div className="text-sm text-gray-600">{client.company_name}</div>
                    )}
                    {client.city && (
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {client.city}, {client.state}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-900 mb-1">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      client.client_type === 'commercial' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {client.client_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(client)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="text-sm font-bold text-blue-600 mb-1">Total Clients</div>
          <div className="text-2xl font-black text-blue-900">{clients.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="text-sm font-bold text-green-600 mb-1">Active</div>
          <div className="text-2xl font-black text-green-900">
            {clients.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="text-sm font-bold text-purple-600 mb-1">Residential</div>
          <div className="text-2xl font-black text-purple-900">
            {clients.filter(c => c.client_type === 'residential').length}
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
          <div className="text-sm font-bold text-orange-600 mb-1">Commercial</div>
          <div className="text-2xl font-black text-orange-900">
            {clients.filter(c => c.client_type === 'commercial').length}
          </div>
        </div>
      </div>

      {/* SMS Composer Modal */}
      {showSMSComposer && selectedClient && (
        <SMSComposer
          client={selectedClient}
          onClose={() => {
            setShowSMSComposer(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && selectedClient && (
        <EnhancedEmailComposer
          client={selectedClient}
          onClose={() => {
            setShowEmailComposer(false);
            setSelectedClient(null);
          }}
        />
      )}

      {/* Client Jobs View Modal */}
      {showJobsView && viewingClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowJobsView(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-gray-900">Client Jobs</h3>
              <Button
                onClick={() => setShowJobsView(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
            <ClientJobsView
              clientEmail={viewingClient.email}
              clientName={viewingClient.name}
              onViewAsCustomer={() => {
                // TODO: Implement customer portal view
                toast({
                  title: 'Coming Soon',
                  description: 'Customer portal view will be available soon',
                });
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Booking Composer Modal */}
      {showBookingComposer && selectedClient && (
        <BookingComposer
          client={selectedClient}
          onClose={() => {
            setShowBookingComposer(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientsManager;
