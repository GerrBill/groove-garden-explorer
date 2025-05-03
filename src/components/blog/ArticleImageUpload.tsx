
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Upload } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";

interface ArticleImageUploadProps {
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ArticleImageUpload: React.FC<ArticleImageUploadProps> = ({ 
  imagePreview, 
  handleFileChange 
}) => {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reset error and loading states when imagePreview changes
  useEffect(() => {
    if (imagePreview) {
      setHasError(false);
      setLoading(true);
    }
  }, [imagePreview]);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Featured Image</label>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-32 sm:h-64 relative overflow-hidden">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
              key={imagePreview ? `upload-${Date.now()}` : 'upload-key'} // Force input reset on preview change
              data-testid="image-upload-input"
            />
            {imagePreview && !hasError ? (
              <>
                <img 
                  src={imagePreview}
                  alt="Article preview" 
                  className="w-full h-full object-cover" 
                  onError={() => {
                    console.error('Error loading image preview:', imagePreview);
                    setHasError(true);
                  }}
                  onLoad={() => setLoading(false)}
                  style={{ display: loading ? 'none' : 'block' }}
                />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Spinner size="lg" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="mt-2 text-sm text-gray-500">
                  {hasError ? 'Error loading image - Click to select a new one' : 'Upload featured image'}
                </span>
                <span className="mt-1 text-xs text-gray-400">Recommended size: 1200 x 800px</span>
              </div>
            )}
          </div>
          {imagePreview && !hasError && (
            <p className="text-xs text-gray-500 mt-1">Click on the image to replace it</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleImageUpload;
