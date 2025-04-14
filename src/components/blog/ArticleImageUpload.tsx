
import React from 'react';
import { Input } from "@/components/ui/input";
import { Upload } from 'lucide-react';

interface ArticleImageUploadProps {
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ArticleImageUpload: React.FC<ArticleImageUploadProps> = ({ 
  imagePreview, 
  handleFileChange 
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Featured Image</label>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md h-32 sm:h-64 relative overflow-hidden">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
            />
            {imagePreview ? (
              <img 
                src={imagePreview}
                alt="Article preview" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="mt-2 text-sm text-gray-500">Upload featured image</span>
                <span className="mt-1 text-xs text-gray-400">Recommended size: 1200 x 800px</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleImageUpload;
