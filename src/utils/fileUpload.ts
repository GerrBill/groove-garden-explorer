
/**
 * Utility function to handle file uploads for the media player using Supabase Storage
 */
import { supabase } from "@/integrations/supabase/client";

// Function to convert a File object to a base64 string (for preview purposes)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to upload an image file to Supabase Storage
export const uploadImageFile = async (file: File, folder: string): Promise<string> => {
  if (!file) {
    console.error('No file provided for upload');
    return '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
  }

  // Generate a unique filename for storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  try {
    console.log(`Uploading file to ${folder}/${fileName}, file size: ${file.size} bytes, type: ${file.type}`);
    
    // Check if the images bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'images')) {
      await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log("Created 'images' bucket");
    }

    // Upload the image file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Explicitly set the content type
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    console.log("File uploaded successfully:", data);

    // Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    // Log the URL to help with debugging
    console.log('Generated public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageFile:', error);
    // Return a placeholder image URL if upload fails
    return '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
  }
};

// Function to upload an audio file to Supabase Storage
export const uploadAudioFile = async (file: File, filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Return the full path to the uploaded file
  return data.path;
};

// Function to get the public URL for an audio file
export const getAudioUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('audio')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Function to generate a unique file path for uploaded audio
export const generateFilePath = (albumId: string, fileName: string): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_'); // Replace special chars
  return `${albumId}/${timestamp}-${cleanFileName}`;
};

// Function to get approximate duration for an audio file (placeholder)
export const getApproximateDuration = (): string => {
  // This is a placeholder - in a real app we would analyze the audio file
  return '3:30';
};

// Function to extract title from filename
export const extractTitleFromFilename = (filename: string): string => {
  // Remove file extension and replace underscores/hyphens with spaces
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
