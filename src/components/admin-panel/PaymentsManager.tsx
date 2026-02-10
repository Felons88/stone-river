import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock, Eye, RefreshCw, Filter, Search, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const PaymentsManager = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    total_revenue: 0,
    completed_count: 0,
    pending_count: 0,
    failed_count: 0,
    flagged_count: 0
  });

  useEffect(() => {
    loadPayments();
    loadEvents();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const calculateStats = (data: any[]) => {
    const completed = data.filter(t => t.status === 'completed');
    const pending = data.filter(t => t.status === 'pending');
    const failed = data.filter(t => t.status === 'failed');
    const flagged = data.filter(t => t.risk_level === 'high' || t.risk_level === 'blocked');

    setStats({
      total_revenue: completed.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
      completed_count: completed.length,
      pending_count: pending.length,
      failed_count: failed.length,
      flagged_count: flagged.length
    });
  };

  const handleApprovePayment = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', transactionId);

      if (error) throw error;

      toast({ title: "Success", description: "Payment approved and completed" });
      loadPayments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve payment", variant: "destructive" });
    }
  };

  const handleRejectPayment = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .update({ status: 'failed', error_message: 'Rejected by admin' })
        .eq('id', transactionId);

      if (error) throw error;

      toast({ title: "Success", description: "Payment rejected" });
      loadPayments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject payment", variant: "destructive" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter || t.risk_level === filter;
    const matchesSearch = !searchTerm || 
      t.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.gateway?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Payment Management</h2>
          <p className="text-gray-600 mt-1">Monitor transactions, manage risk, and handle disputes</p>
        </div>
        <Button onClick={loadPayments} variant="outline" className="font-bold">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-sm font-semibold opacity-90">Total Revenue</p>
          <p className="text-3xl font-black">${stats.total_revenue.toFixed(2)}</p>
          <p className="text-xs opacity-70 mt-1">{stats.completed_count} completed</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold opacity-90">Pending Review</p>
          <p className="text-3xl font-black">{stats.pending_count}</p>
          <p className="text-xs opacity-70 mt-1">Awaiting verification</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold opacity-90">Failed Payments</p>
          <p className="text-3xl font-black">{stats.failed_count}</p>
          <p className="text-xs opacity-70 mt-1">Requires attention</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8" />
            <AlertTriangle className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-sm font-semibold opacity-90">Flagged/High Risk</p>
          <p className="text-3xl font-black">{stats.flagged_count}</p>
          <p className="text-xs opacity-70 mt-1">Security review needed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="font-bold"
            >
              All
            </Button>
            <Button
              onClick={() => setFilter('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              className="font-bold"
            >
              Completed
            </Button>
            <Button
              onClick={() => setFilter('pending')}
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              className="font-bold"
            >
              Pending
            </Button>
            <Button
              onClick={() => setFilter('failed')}
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              className="font-bold"
            >
              Failed
            </Button>
            <Button
              onClick={() => setFilter('high')}
              variant={filter === 'high' ? 'default' : 'outline'}
              size="sm"
              className="font-bold"
            >
              High Risk
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No transactions found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Gateway</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Risk</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {transaction.transaction_id?.slice(0, 16)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {transaction.gateway?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ${parseFloat(transaction.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">{transaction.customer_name || 'N/A'}</div>
                        <div className="text-gray-600">{transaction.customer_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(transaction.risk_level)}`}>
                        {transaction.risk_level || 'low'} ({transaction.risk_score || 0})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {transaction.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprovePayment(transaction.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectPayment(transaction.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Transaction ID</p>
                  <p className="font-mono text-sm font-bold text-gray-900">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Gateway</p>
                  <p className="font-bold text-gray-900">{selectedTransaction.gateway}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Amount</p>
                  <p className="text-2xl font-black text-green-600">${parseFloat(selectedTransaction.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Customer Email</p>
                  <p className="font-bold text-gray-900">{selectedTransaction.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Customer IP</p>
                  <p className="font-bold text-gray-900">{selectedTransaction.customer_ip || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Risk Score</p>
                  <p className="font-bold text-gray-900">{selectedTransaction.risk_score || 0}/100</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase">Risk Level</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(selectedTransaction.risk_level)}`}>
                    {selectedTransaction.risk_level || 'low'}
                  </span>
                </div>
              </div>

              {selectedTransaction.error_message && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-900 mb-1">Error Message</p>
                  <p className="text-sm text-red-700">{selectedTransaction.error_message}</p>
                </div>
              )}

              {selectedTransaction.metadata && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Metadata</p>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PaymentsManager;
