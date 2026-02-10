import { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Star, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFeaturedPhotos, toggleFeatured, deletePhoto } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface Photo {
  id: string;
  file_name: string;
  photo_type: string;
  caption?: string;
  is_featured: boolean;
  created_at: string;
  publicUrl: string;
}

interface PhotoGalleryProps {
  limit?: number;
  showControls?: boolean;
  columns?: 2 | 3 | 4;
}

const PhotoGallery = ({ limit = 20, showControls = false, columns = 3 }: PhotoGalleryProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPhotos();
  }, [limit]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getFeaturedPhotos(limit);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast({
        title: 'Error',
        description: 'Failed to load photos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (photoId: string, currentStatus: boolean) => {
    try {
      const result = await toggleFeatured(photoId, !currentStatus);
      if (result.success) {
        toast({
          title: 'Success',
          description: `Photo ${!currentStatus ? 'featured' : 'unfeatured'}`,
        });
        loadPhotos();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update photo',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const result = await deletePhoto(photoId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Photo deleted',
        });
        loadPhotos();
        setSelectedPhoto(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete photo',
        variant: 'destructive',
      });
    }
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">No photos yet</p>
        <p className="text-gray-500 text-sm mt-2">Photos will appear here once uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-gray-200 hover:border-primary transition-all"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.publicUrl}
              alt={photo.caption || photo.file_name}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {photo.caption && (
                  <p className="text-white font-semibold text-sm mb-2">{photo.caption}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-xs capitalize">{photo.photo_type}</span>
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Featured Badge */}
            {photo.is_featured && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </div>
            )}

            {/* Admin Controls */}
            {showControls && (
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFeatured(photo.id, photo.is_featured);
                  }}
                  className={`p-2 rounded-full ${
                    photo.is_featured ? 'bg-yellow-500' : 'bg-gray-800'
                  } text-white hover:scale-110 transition-transform`}
                  title={photo.is_featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className={`w-4 h-4 ${photo.is_featured ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                  className="p-2 rounded-full bg-red-500 text-white hover:scale-110 transition-transform"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.publicUrl}
              alt={selectedPhoto.caption || selectedPhoto.file_name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-4 text-lg font-semibold">
                {selectedPhoto.caption}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="text-white/60 text-sm capitalize">
                {selectedPhoto.photo_type}
              </span>
              <span className="text-white/60 text-sm">
                {new Date(selectedPhoto.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
