
import React from 'react';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ imagePreview, handleFileChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <div className="w-full md:w-1/2">
        <FormLabel className="text-xs">Album Cover</FormLabel>
        <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md h-24">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="album-cover"
          />
          <label
            htmlFor="album-cover"
            className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
          >
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="mt-1 text-xs text-gray-500">Click to browse</span>
          </label>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center">
        {imagePreview ? (
          <div className="relative w-24 h-24 overflow-hidden rounded-md">
            <img
              src={imagePreview}
              alt="Album preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-24 h-24 bg-gray-800 rounded-md">
            <ImageIcon className="w-6 h-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-400">No image selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
