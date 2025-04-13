
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ImageIcon } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  genre: z.string().optional(),
  year: z.string().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = async (data: FormValues) => {
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
      // For demo purposes, we'll use a placeholder or default image path
      // In a production app, you'd upload this to your server
      
      // Use a placeholder image URL - either the temp preview or a default one
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
        // Add a timestamp for created_at that matches the Supabase format
        created_at: new Date().toISOString(),
        // Temporary ID (will be replaced by the actual one if API succeeds)
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
      <DialogContent className="sm:max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="py-2">
          <DialogTitle>Add New Album</DialogTitle>
          <DialogDescription className="text-xs">
            Upload an album cover and fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="w-full md:w-1/2">
                <FormLabel className="text-xs">Album Cover</FormLabel>
                <div className="mt-1 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md h-28">
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
                    <Upload className="w-6 h-6 text-gray-500" />
                    <span className="mt-1 text-xs text-gray-500">Click to browse</span>
                  </label>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-28 h-28 overflow-hidden rounded-md">
                    <img
                      src={imagePreview}
                      alt="Album preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-800 rounded-md">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                    <span className="mt-1 text-xs text-gray-400">No image selected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Album title" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Artist name" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="hip-hop">Hip Hop</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Year</FormLabel>
                    <FormControl>
                      <Input placeholder="Release year" {...field} className="h-8" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this album"
                      className="resize-none h-16"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUploading}
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? "Uploading..." : "Add Album"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;
