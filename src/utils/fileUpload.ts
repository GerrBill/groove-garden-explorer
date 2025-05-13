/**
 * Utility function to handle file uploads for the media player using Supabase Storage
 */
import { supabase } from "@/integrations/supabase/client";
import { isYouTubeUrl, extractYouTubeVideoId, getYouTubeThumbnailUrl } from "./youtubeUtils";

// Function to convert a File object to a base64 string (for preview purposes)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to fetch a remote image as a blob
export const fetchImageAsBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  return await response.blob();
};

// Function to upload an image file to Supabase Storage
export const uploadImageFile = async (file: File | string, folder: string): Promise<string> => {
  if (!file) {
    console.error('No file provided for upload');
    return '/placeholder.svg';
  }

  // Handle YouTube URL case
  if (typeof file === 'string' && isYouTubeUrl(file)) {
    const videoId = extractYouTubeVideoId(file);
    if (videoId) {
      const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
      console.log('Using YouTube thumbnail URL:', thumbnailUrl);
      return thumbnailUrl;
    }
  }

  // Handle URL string that might be a YouTube thumbnail already
  if (typeof file === 'string' && file.includes('img.youtube.com')) {
    console.log('Using existing YouTube thumbnail URL:', file);
    return file;
  }

  // If it's a string URL but not a YouTube URL or thumbnail, try to fetch it and convert to File
  if (typeof file === 'string' && file.startsWith('http')) {
    try {
      console.log('Fetching remote image URL:', file);
      const blob = await fetchImageAsBlob(file);
      const filename = file.split('/').pop() || 'image.jpg';
      file = new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error fetching remote image:', error);
      return file; // Return the original URL if we can't fetch it
    }
  }

  // At this point, file should be a File object
  if (!(file instanceof File)) {
    console.error('Invalid file type for upload:', typeof file);
    return typeof file === 'string' ? file : '/placeholder.svg';
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    console.error('Invalid file type:', file.type);
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Generate a unique filename for storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  try {
    console.log(`Uploading file to ${folder}/${fileName}, file size: ${file.size} bytes, type: ${file.type}`);
    
    // Create images bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'images')) {
      await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log("Created 'images' bucket");
    }

    // Directly convert to base64 as a fallback strategy
    const base64Data = await fileToBase64(file);
    
    // Try uploading to storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type // Explicitly set the content type
      });

    if (error) {
      console.error('Error uploading image to storage:', error);
      // Return the base64 data as fallback
      console.log('Using base64 fallback for image');
      return base64Data;
    }
    
    console.log("File uploaded successfully:", data);

    // Get the public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    if (!urlData || !urlData.publicUrl) {
      console.log('Failed to get public URL - using base64 fallback');
      return base64Data;
    }
    
    console.log('Generated public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImageFile:', error);
    // Try to get base64 as fallback
    try {
      if (file instanceof File) {
        return await fileToBase64(file);
      } else {
        return '/placeholder.svg';
      }
    } catch (innerError) {
      console.error('Failed to create base64 fallback:', innerError);
      return '/placeholder.svg';
    }
  }
};

// Convert image to base64 for direct storage in the database
export const imageToBase64 = async (imageFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(imageFile);
  });
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
