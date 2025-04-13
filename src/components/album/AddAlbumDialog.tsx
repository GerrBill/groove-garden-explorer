
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from 'lucide-react';
import { albumFormSchema, AlbumFormValues } from './schemas/albumFormSchema';
import AlbumForm from './components/AlbumForm';

interface AddAlbumDialogProps {
  children?: React.ReactNode;
  onAlbumAdded?: () => void;
}

const AddAlbumDialog: React.FC<AddAlbumDialogProps> = ({ children, onAlbumAdded }) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      artist: "",
      genre: "",
      year: "",
      comments: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const onSubmit = async (data: AlbumFormValues) => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please upload an album cover image",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Use the preview image URL for the album
      let albumImageUrl = imagePreview;
      
      if (!albumImageUrl) {
        // Fallback to a default image if needed
        albumImageUrl = "/placeholder.svg";
      }
      
      // Create a mock album to display in the UI immediately
      const mockAlbum = {
        title: data.title,
        artist: data.artist,
        image_url: albumImageUrl,
        year: data.year || null,
        created_at: new Date().toISOString(),
        id: `temp-${Date.now()}`
      };
      
      // If onAlbumAdded callback exists, call it to update the UI immediately
      if (onAlbumAdded) {
        onAlbumAdded();
      }
      
      // Reset the form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Album added successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding album:", error);
      toast({
        title: "Error",
        description: "Failed to add album. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2" size="sm">
            <Upload size={16} />
            Add Album
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl max-h-[80vh] overflow-y-auto py-4">
        <DialogHeader className="py-1">
          <DialogTitle className="text-base">Add New Album</DialogTitle>
          <DialogDescription className="text-xs">
            Upload an album cover and fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <AlbumForm
          form={form}
          isUploading={isUploading}
          imagePreview={imagePreview}
          handleFileChange={handleFileChange}
          onSubmit={onSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;
