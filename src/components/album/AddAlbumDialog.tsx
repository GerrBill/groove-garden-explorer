
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
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
      // Generate a unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `album_covers/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('albums')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('albums')
        .getPublicUrl(filePath);

      // Add album to the database
      const { error: insertError } = await supabase
        .from('albums')
        .insert({
          title: data.title,
          artist: data.artist,
          image_url: publicUrlData.publicUrl,
          year: data.year || null,
          // Add any other fields
        });

      if (insertError) throw insertError;

      // Reset the form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
      
      // Notify the parent component that an album was added
      if (onAlbumAdded) {
        onAlbumAdded();
      }
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
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Album</DialogTitle>
          <DialogDescription>
            Upload an album cover and fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2">
                <FormLabel>Album Cover</FormLabel>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-gray-600 rounded-md p-4 h-36">
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
                    <Upload className="w-8 h-8 text-gray-500" />
                    <span className="mt-2 text-sm text-gray-500">Click to browse</span>
                  </label>
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-36 h-36 overflow-hidden rounded-md">
                    <img
                      src={imagePreview}
                      alt="Album preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-36 h-36 bg-gray-800 rounded-md">
                    <ImageIcon className="w-10 h-10 text-gray-400" />
                    <span className="mt-2 text-xs text-gray-400">No image selected</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Artist name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input placeholder="Release year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this album"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
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
