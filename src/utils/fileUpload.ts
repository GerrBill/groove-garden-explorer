
/**
 * Utility function to handle file uploads for the media player
 */

// Function to convert a File object to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to get approximate duration for an audio file
// In a real app, this could be more sophisticated using the Web Audio API
export const getApproximateDuration = (): string => {
  // This is a placeholder - in a real app we would analyze the audio file
  return '3:30';
};

// Function to generate a unique file path for uploaded audio
export const generateFilePath = (albumId: string, fileName: string): string => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_'); // Replace special chars
  return `${albumId}/${timestamp}-${cleanFileName}`;
};
