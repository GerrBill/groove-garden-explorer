import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ArticleImageUpload from './ArticleImageUpload';
import RichTextEditor from './RichTextEditor';
import { useToast } from '@/hooks/use-toast';

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  imageFile?: File | null;
}

interface ArticleFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
  initialValues?: ArticleFormValues;
  imageUrl?: string;
  isEditing?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  isSubmitting,
  onSubmit,
  onCancel,
  initialValues,
  imageUrl,
  isEditing = false
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null);
  const { toast } = useToast();
  
  const form = useForm<ArticleFormValues>({
    defaultValues: initialValues || {
      title: "",
      subtitle: "",
      content: "",
      category: "Fashion",
      author: "",
    }
  });

  // Update image preview when imageUrl prop changes
  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Set the file for upload
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Log file details
      console.log('Image file selected:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
  };

  const handleFormSubmit = (values: ArticleFormValues) => {
    // Add the selected image file to the form values
    const formData = {
      ...values,
      imageFile: imageFile
    };
    
    // Log the data being submitted
    console.log('Submitting form with values:', formData);
    console.log('Image file included:', imageFile ? imageFile.name : 'No file');
    
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <ArticleImageUpload 
          imagePreview={imagePreview} 
          handleFileChange={handleImageChange} 
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Article Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter an attention-grabbing title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Subtitle</FormLabel>
              <FormControl>
                <Input placeholder="Add a subtitle or brief description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">Article Content</FormLabel>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                    placeholder="Write your article content here..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Category</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Fashion, Lifestyle, Travel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Author</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your name" 
                    {...field} 
                    disabled={isEditing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Article' : 'Create Article')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleForm;
