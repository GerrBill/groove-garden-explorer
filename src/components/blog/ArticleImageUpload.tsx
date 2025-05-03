
import React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ArticleImageUploadProps {
  imagePreview?: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

const ArticleImageUpload: React.FC<ArticleImageUploadProps> = ({
  imagePreview,
  handleFileChange,
  isLoading = false
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full h-[200px] mb-4 border-2 border-dashed border-gray-300 rounded-md overflow-hidden flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        {isLoading ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : null}
        
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Article preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load image preview");
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="text-center p-4">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to upload featured image</p>
            <p className="text-xs text-gray-500">(Max size: 5MB)</p>
          </div>
        )}

        <input 
          type="file" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default ArticleImageUpload;
