import { motion } from "framer-motion";
import { Calendar, DollarSign, Star, Users, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  stats: any;
  loading: boolean;
  onRefresh: () => void;
}

const DashboardOverview = ({ stats, loading, onRefresh }: DashboardOverviewProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      change: `${stats?.pendingBookings || 0} pending`,
    },
    {
      title: "Pending Bookings",
      value: stats?.pendingBookings || 0,
      icon: Calendar,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50",
      change: "Needs attention",
    },
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      change: "From paid invoices",
    },
    {
      title: "Average Rating",
      value: stats?.averageRating?.toFixed(1) || "5.0",
      icon: Star,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
      change: `${stats?.totalReviews || 0} reviews`,
    },
    {
      title: "Completed Jobs",
      value: stats?.completedJobs || 0,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      change: "All time",
    },
    {
      title: "Active Referrals",
      value: stats?.totalReferrals || 0,
      icon: Users,
      color: "from-indigo-500 to-blue-600",
      bgColor: "bg-indigo-50",
      change: `${stats?.completedReferrals || 0} completed`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">Real-time business metrics and analytics</p>
        </div>
        <Button onClick={onRefresh} variant="outline" className="font-bold">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-2xl p-6 border-2 border-gray-200 hover:shadow-xl transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-gray-600">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Button className="bg-primary hover:bg-primary/90 font-bold h-auto py-4">
            <Calendar className="w-5 h-5 mr-2" />
            New Booking
          </Button>
          <Button variant="outline" className="font-bold h-auto py-4">
            <Star className="w-5 h-5 mr-2" />
            Add Review
          </Button>
          <Button variant="outline" className="font-bold h-auto py-4">
            <Users className="w-5 h-5 mr-2" />
            Send SMS
          </Button>
          <Button variant="outline" className="font-bold h-auto py-4">
            <DollarSign className="w-5 h-5 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 p-6">
        <h3 className="text-xl font-black text-gray-900 mb-4">Dashboard Info</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
            <div>
              <p className="text-gray-900 font-bold">Real-time Data</p>
              <p className="text-sm text-gray-600">All metrics are updated in real-time from your database</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
            <div>
              <p className="text-gray-900 font-bold">Revenue Tracking</p>
              <p className="text-sm text-gray-600">Revenue calculated from paid invoices</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
            <div>
              <p className="text-gray-900 font-bold">Notifications</p>
              <p className="text-sm text-gray-600">Check the Alerts tab for payment notifications and fraud alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
