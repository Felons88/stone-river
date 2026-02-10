// Supabase Storage Helper Functions
import { supabase } from './supabase';

const BUCKET_NAME = 'jobs';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

// Upload photo to Supabase Storage
export async function uploadPhoto(
  file: File,
  bookingId: string,
  photoType: 'before' | 'after' | 'during' | 'quote' | 'other' = 'other'
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit',
      };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.',
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const fileName = `${bookingId}/${photoType}_${timestamp}_${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Save to database
    const { error: dbError } = await supabase
      .from('job_photos')
      .insert([{
        booking_id: bookingId,
        photo_type: photoType,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: 'customer',
      }]);

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to delete uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      return {
        success: false,
        error: 'Failed to save photo record',
      };
    }

    return {
      success: true,
      filePath: fileName,
      publicUrl: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

// Upload multiple photos
export async function uploadMultiplePhotos(
  files: File[],
  bookingId: string,
  photoType: 'before' | 'after' | 'during' | 'quote' | 'other' = 'other'
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const file of files) {
    const result = await uploadPhoto(file, bookingId, photoType);
    results.push(result);
  }

  return results;
}

// Get photos for a booking
export async function getBookingPhotos(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from('job_photos')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add public URLs
    const photosWithUrls = data?.map((photo) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(photo.file_path);
      
      return {
        ...photo,
        publicUrl: urlData.publicUrl,
      };
    });

    return photosWithUrls || [];
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

// Get featured photos for gallery
export async function getFeaturedPhotos(limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('job_photos')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const photosWithUrls = data?.map((photo) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(photo.file_path);
      
      return {
        ...photo,
        publicUrl: urlData.publicUrl,
      };
    });

    return photosWithUrls || [];
  } catch (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }
}

// Delete photo
export async function deletePhoto(photoId: string) {
  try {
    // Get photo record
    const { data: photo, error: fetchError } = await supabase
      .from('job_photos')
      .select('file_path')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([photo.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('job_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error: any) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Toggle featured status
export async function toggleFeatured(photoId: string, isFeatured: boolean) {
  try {
    const { error } = await supabase
      .from('job_photos')
      .update({ is_featured: isFeatured })
      .eq('id', photoId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Toggle featured error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default {
  uploadPhoto,
  uploadMultiplePhotos,
  getBookingPhotos,
  getFeaturedPhotos,
  deletePhoto,
  toggleFeatured,
};
