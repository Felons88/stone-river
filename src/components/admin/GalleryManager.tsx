import { useState } from "react";
import { Upload, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const GalleryManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Gallery Management</h2>
          <p className="text-gray-600 mt-1">Upload and manage before/after photos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-bold">
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Gallery management coming soon</p>
      </div>
    </div>
  );
};

export default GalleryManager;
