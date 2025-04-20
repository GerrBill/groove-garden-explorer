import React, { useState } from 'react';
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
  
  const form = useForm<ArticleFormValues>({
    defaultValues: initialValues || {
      title: "",
      subtitle: "",
      content: "",
      category: "Fashion",
      author: "",
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
