
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
export const uploadImageFile = async (file: File, albumId: string): Promise<string> => {
  // Generate a unique filename for storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `albums/${albumId}/${fileName}`;
  
  // Upload the image file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL for the uploaded image
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
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
