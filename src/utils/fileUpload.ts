
/**
 * Utility function to handle file uploads for the media player
 */

// Create a Map to store audio data in memory instead of localStorage
const audioFileStore = new Map<string, string>();

// Function to convert a File object to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Function to store an audio file in memory
export const storeAudioFile = (path: string, audioData: string): void => {
  audioFileStore.set(path, audioData);
};

// Function to retrieve an audio file from memory
export const getAudioFile = (path: string): string | undefined => {
  return audioFileStore.get(path);
};

// Function to get approximate duration for an audio file
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

// Function to extract title from filename
export const extractTitleFromFilename = (filename: string): string => {
  // Remove file extension and replace underscores/hyphens with spaces
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};
