
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from './components/ImageUpload';

interface UpdateAlbumArtDialogProps {
  albumId: string;
  currentImage?: string;
  onImageUpdated: (newImageUrl: string) => void;
}

const UpdateAlbumArtDialog: React.FC<UpdateAlbumArtDialogProps> = ({
  albumId,
  currentImage,
  onImageUpdated
}) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUpdateImage = async () => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate a unique filename for the image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${albumId}/${Date.now()}-album-cover.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload the image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      // Update the album's image_url in the database
      const { error: updateError } = await supabase
        .from('albums')
        .update({ image_url: publicUrl })
        .eq('id', albumId);

      if (updateError) throw updateError;
      
      // Call the callback with the new image URL
      onImageUpdated(publicUrl);
      
      // Reset the state and close the dialog
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Album art updated successfully!",
      });
    } catch (error) {
      console.error("Error updating album art:", error);
      toast({
        title: "Error",
        description: "Failed to update album art. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ImageIcon size={14} />
          <span className="text-xs">Update Cover</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Album Art</DialogTitle>
          <DialogDescription>
            Upload a new image for this album cover.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ImageUpload
            imagePreview={imagePreview}
            handleFileChange={handleFileChange}
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateImage}
              disabled={isUploading || !imageFile}
            >
              {isUploading ? "Updating..." : "Update Album Art"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAlbumArtDialog;
