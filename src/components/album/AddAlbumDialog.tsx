
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Form schema with Zod validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  genre: z.string().optional(),
  year: z.string().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddAlbumDialog = () => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize the form
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

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear the selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  // Submit the form
  const onSubmit = async (data: FormValues) => {
    if (!imageFile) {
      toast({
        title: "Image required",
        description: "Please upload an album cover image",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Upload the image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `album-covers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('albums')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('albums')
        .getPublicUrl(filePath);
      
      // 3. Insert the album record
      const { error: insertError } = await supabase
        .from('albums')
        .insert({
          title: data.title,
          artist: data.artist,
          image_url: publicUrlData.publicUrl,
          year: data.year || null,
          // Store additional info in existing fields
          track_count: data.genre || null,  // Using track_count to store genre
          duration: data.comments || null,  // Using duration to store comments
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Album added",
        description: "Your album has been successfully added",
      });
      
      // Reset form and close dialog
      form.reset();
      clearImage();
      setOpen(false);
      
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
        <Button className="gap-2" size="sm">
          <Upload size={16} />
          Add Album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Album</DialogTitle>
          <DialogDescription>
            Upload album cover art and provide album details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Image Upload Section */}
            <div className="w-full sm:w-1/2 space-y-2">
              <label className="text-sm font-medium leading-none">
                Album Cover
              </label>
              <div className="border-2 border-dashed border-zinc-700 rounded-md p-4 hover:border-orange-700 transition-colors">
                <input
                  type="file"
                  id="album-cover"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                
                <label 
                  htmlFor="album-cover" 
                  className="flex flex-col items-center gap-2 cursor-pointer text-center p-4"
                >
                  <ImageIcon className="h-10 w-10 text-orange-700" />
                  <span className="text-sm font-medium">
                    {imageFile ? 'Change Image' : 'Upload Cover Art'}
                  </span>
                  <span className="text-xs text-spotify-text-secondary">
                    JPG, PNG or GIF (max 5MB)
                  </span>
                </label>
              </div>
            </div>
            
            {/* Image Preview */}
            <div className="w-full sm:w-1/2">
              <div className="rounded-md overflow-hidden bg-zinc-800 h-full">
                {imagePreview ? (
                  <div className="relative h-full">
                    <AspectRatio ratio={1/1}>
                      <img
                        src={imagePreview}
                        alt="Album preview"
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 transition-all"
                      disabled={isUploading}
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <p className="text-xs text-spotify-text-secondary">
                      Preview will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Album Details Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Album title" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Artist Field */}
                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Artist</FormLabel>
                      <FormControl>
                        <Input placeholder="Artist name" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Genre Field */}
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input placeholder="Genre" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Year Field */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input placeholder="Release year" {...field} disabled={isUploading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Comments Field */}
              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about this album" 
                        {...field} 
                        className="resize-none" 
                        rows={3}
                        disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Form Actions */}
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isUploading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Saving..." : "Save Album"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlbumDialog;
