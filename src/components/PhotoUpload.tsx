import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadMultiplePhotos } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  bookingId: string;
  photoType?: 'before' | 'after' | 'during' | 'quote' | 'other';
  maxFiles?: number;
  onUploadComplete?: () => void;
}

const PhotoUpload = ({ 
  bookingId, 
  photoType = 'other', 
  maxFiles = 10,
  onUploadComplete 
}: PhotoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} photos allowed`,
        variant: 'destructive',
      });
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: `${file.name} is not an image`,
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [selectedFiles, maxFiles, toast]);

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one photo',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      const results = await uploadMultiplePhotos(selectedFiles, bookingId, photoType);
      setUploadResults(results);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast({
          title: 'Upload complete',
          description: `${successCount} photo(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });

        // Clear successful uploads
        const failedIndices = results
          .map((r, i) => (!r.success ? i : -1))
          .filter(i => i !== -1);

        setSelectedFiles(prev => prev.filter((_, i) => failedIndices.includes(i)));
        setPreviews(prev => prev.filter((_, i) => failedIndices.includes(i)));

        if (failedIndices.length === 0 && onUploadComplete) {
          onUploadComplete();
        }
      } else {
        toast({
          title: 'Upload failed',
          description: 'All uploads failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload error',
        description: error.message || 'Failed to upload photos',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;

    handleFileSelect({ target: input } as any);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer"
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-bold text-gray-700 mb-2">
            Drop photos here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, or WebP • Max 5MB per file • Up to {maxFiles} photos
          </p>
        </label>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => handleRemoveFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
              {uploadResults[index] && (
                <div className="absolute bottom-2 left-2">
                  {uploadResults[index].success ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1 truncate">
                {selectedFiles[index]?.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-primary hover:bg-primary/90 font-bold"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Photos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
