import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Blog Management</h2>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-bold">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Blog management coming soon</p>
      </div>
    </div>
  );
};

export default BlogManager;
