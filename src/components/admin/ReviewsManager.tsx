import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReviewsManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Reviews Management</h2>
          <p className="text-gray-600 mt-1">Moderate and respond to customer reviews</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Reviews management coming soon</p>
      </div>
    </div>
  );
};

export default ReviewsManager;
