import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Upload,
  Download,
  Search,
  Filter,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  description: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  created_at: string;
}

interface JobPhoto {
  id: string;
  job_id: string;
  photo_url: string;
  caption: string;
  uploaded_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'contacts' | 'photos' | 'hero'>('contacts');
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<ContactForm | null>(null);
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth');
    if (isAuthenticated) {
      fetchContacts();
      fetchPhotos();
    }
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch photos",
        variant: "destructive",
      });
    }
  };

  const updateContactStatus = async (id: string, status: ContactForm['status']) => {
    try {
      const { error } = await supabase
        .from('contact_forms')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.map(c => c.id === id ? { ...c, status } : c));
      toast({
        title: "Success",
        description: "Contact status updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const { error } = await supabase
        .from('contact_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(c => c.id !== id));
      toast({
        title: "Success",
        description: "Contact deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPhotos(photos.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Photo deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Service', 'Status', 'Date'];
    const rows = filteredContacts.map(c => [
      c.name,
      c.email,
      c.phone,
      c.address,
      c.service_type,
      c.status,
      new Date(c.created_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContactForm['status']) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
      contacted: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Phone },
      completed: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${variant.color}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: contacts.length,
    pending: contacts.filter(c => c.status === 'pending').length,
    contacted: contacts.filter(c => c.status === 'contacted').length,
    completed: contacts.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">ADMIN DASHBOARD</h1>
              <p className="text-sm text-gray-600">StoneRiver Property Services</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                localStorage.removeItem('adminAuth');
                navigate('/admin/login');
                toast({
                  title: "Logged out",
                  description: "You have been logged out successfully",
                });
              }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Contacts', value: stats.total, color: 'bg-blue-500', icon: User },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', icon: Clock },
            { label: 'Contacted', value: stats.contacted, color: 'bg-purple-500', icon: Phone },
            { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: CheckCircle },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('contacts')}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                  activeTab === 'contacts'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                Contact Forms ({contacts.length})
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                  activeTab === 'photos'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Job Photos ({photos.length})
              </button>
              <button
                onClick={() => setActiveTab('hero')}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-colors ${
                  activeTab === 'hero'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Hero Before/After
              </button>
            </div>
          </div>

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-gray-700 focus:outline-none focus:border-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button onClick={exportToCSV} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              {/* Contacts Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">No contacts found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Contact</th>
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Service</th>
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Date</th>
                        <th className="text-left py-3 px-4 font-black text-gray-900 uppercase text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-600">{contact.address}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </a>
                              <a href={`tel:${contact.phone}`} className="text-sm text-gray-700 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </a>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-semibold text-gray-700">{contact.service_type}</span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(contact.status)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(contact.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedContact(contact)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <select
                                value={contact.status}
                                onChange={(e) => updateContactStatus(contact.id, e.target.value as ContactForm['status'])}
                                className="px-2 py-1 text-xs border rounded font-semibold"
                              >
                                <option value="pending">Pending</option>
                                <option value="contacted">Contacted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteContact(contact.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {photo.caption && (
                      <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero Before/After Tab */}
          {activeTab === 'hero' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900 mb-2">Hero Section Before/After Images</h3>
                <p className="text-gray-600">Upload images to display in the hero section slider. Recommended size: 800x600px</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Before Image */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 uppercase">Before Image</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                    </div>
                  </div>
                  <Input type="file" accept="image/*" className="mb-2" />
                  <Button className="w-full">Upload Before Image</Button>
                </div>

                {/* After Image */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4 uppercase">After Image</h4>
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload</p>
                    </div>
                  </div>
                  <Input type="file" accept="image/*" className="mb-2" />
                  <Button className="w-full">Upload After Image</Button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Images will be automatically optimized for web display. For best results, use high-quality images showing clear before/after transformations of your junk removal work.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedContact(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Contact Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Name</label>
                <p className="text-lg text-gray-900">{selectedContact.name}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Email</label>
                <p className="text-lg text-gray-900">{selectedContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Phone</label>
                <p className="text-lg text-gray-900">{selectedContact.phone}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Address</label>
                <p className="text-lg text-gray-900">{selectedContact.address}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Service Type</label>
                <p className="text-lg text-gray-900">{selectedContact.service_type}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Description</label>
                <p className="text-gray-700">{selectedContact.description}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600 uppercase">Status</label>
                <div className="mt-2">{getStatusBadge(selectedContact.status)}</div>
              </div>
            </div>
            <Button onClick={() => setSelectedContact(null)} className="mt-6 w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
