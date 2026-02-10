import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  RefreshCw,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Award,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

const GoogleReviewsManager = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'featured'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData, historyData, settingsData] = await Promise.all([
        filter === 'featured' ? api.googleReviews.getFeatured() :
        filter === 'published' ? api.googleReviews.getPublished() :
        api.googleReviews.getAll(),
        api.googleReviews.getStats(),
        api.googleReviews.getSyncHistory(),
        api.googleReviews.getSettings(),
      ]);
      
      setReviews(reviewsData || []);
      setStats(statsData?.[0] || null);
      setSyncHistory(historyData || []);
      setSettings(settingsData || {});
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await api.googleReviews.syncNow();
      toast({
        title: "Sync Started",
        description: "Google reviews are being synced. This may take a moment.",
      });
      setTimeout(() => loadData(), 3000);
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleFeatured = async (review: any) => {
    try {
      await api.googleReviews.update(review.id, { is_featured: !review.is_featured });
      setReviews(reviews.map(r => 
        r.id === review.id ? { ...r, is_featured: !r.is_featured } : r
      ));
      toast({
        title: review.is_featured ? "Removed from Featured" : "Added to Featured",
        description: "Review updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (review: any) => {
    try {
      const newStatus = review.status === 'published' ? 'hidden' : 'published';
      await api.googleReviews.update(review.id, { status: newStatus });
      setReviews(reviews.map(r => 
        r.id === review.id ? { ...r, status: newStatus } : r
      ));
      toast({
        title: "Status Updated",
        description: `Review ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.googleReviews.delete(id);
      setReviews(reviews.filter(r => r.id !== id));
      toast({
        title: "Review Deleted",
        description: "Review has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Google Reviews</h2>
          <p className="text-gray-600 mt-1">Manage and sync reviews from Google Business Profile</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="font-bold">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleSyncNow} disabled={syncing} className="font-bold">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <span className="text-3xl font-black text-yellow-600">
                {stats.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-700">Average Rating</p>
            <p className="text-xs text-gray-600">{stats.total_reviews} total reviews</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-black text-green-600">{stats.five_star || 0}</span>
            </div>
            <p className="text-sm font-bold text-gray-700">5-Star Reviews</p>
            <p className="text-xs text-gray-600">
              {stats.total_reviews > 0 ? Math.round((stats.five_star / stats.total_reviews) * 100) : 0}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-black text-blue-600">{reviews.length}</span>
            </div>
            <p className="text-sm font-bold text-gray-700">Total Reviews</p>
            <p className="text-xs text-gray-600">In database</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-bold text-purple-600">
                {settings?.last_sync_at 
                  ? new Date(settings.last_sync_at).toLocaleString()
                  : 'Never'}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-700">Last Sync</p>
            <p className="text-xs text-gray-600">Auto-syncs every hour</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className="font-bold"
        >
          All Reviews
        </Button>
        <Button
          onClick={() => setFilter('published')}
          variant={filter === 'published' ? 'default' : 'outline'}
          className="font-bold"
        >
          Published
        </Button>
        <Button
          onClick={() => setFilter('featured')}
          variant={filter === 'featured' ? 'default' : 'outline'}
          className="font-bold"
        >
          Featured
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-bold text-lg">No reviews found</p>
            <p className="text-gray-500 text-sm mt-1">
              Click "Sync Now" to fetch reviews from Google
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {review.author_photo_url && (
                    <img
                      src={review.author_photo_url}
                      alt={review.author_name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{review.author_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 font-semibold">
                        {new Date(review.review_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.is_featured && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border-2 border-yellow-300">
                      <Award className="w-3 h-3 inline mr-1" />
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border-2 ${
                    review.status === 'published'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}>
                    {review.status}
                  </span>
                </div>
              </div>

              {review.review_text && (
                <p className="text-gray-700 mb-4 leading-relaxed">{review.review_text}</p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => handleToggleFeatured(review)}
                  size="sm"
                  variant="outline"
                  className="font-bold"
                >
                  <Award className="w-4 h-4 mr-1" />
                  {review.is_featured ? 'Unfeature' : 'Feature'}
                </Button>
                <Button
                  onClick={() => handleToggleStatus(review)}
                  size="sm"
                  variant="outline"
                  className="font-bold"
                >
                  {review.status === 'published' ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDelete(review.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-black text-gray-900 mb-4">Recent Sync History</h3>
          <div className="space-y-2">
            {syncHistory.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {log.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : log.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {log.status === 'completed' 
                        ? `Synced ${log.reviews_fetched} reviews (${log.reviews_added} new, ${log.reviews_updated} updated)`
                        : log.status === 'failed'
                        ? `Failed: ${log.error_message}`
                        : 'Sync in progress...'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.sync_started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleReviewsManager;
