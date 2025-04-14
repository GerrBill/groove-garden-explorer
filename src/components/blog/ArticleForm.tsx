
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List
} from 'lucide-react';
import ArticleImageUpload from './ArticleImageUpload';

interface ArticleFormProps {
  isSubmitting: boolean;
  onSubmit: (values: ArticleFormValues) => void;
  onCancel: () => void;
}

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  isSubmitting,
  onSubmit,
  onCancel
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<ArticleFormValues>({
    defaultValues: {
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
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (values: ArticleFormValues) => {
    onSubmit({
      ...values,
      imageFile,
    });
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
          
          <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-input">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="h-5 border-r border-zinc-300 dark:border-zinc-600 mx-1"></div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Write your article content here..."
                    className="min-h-[300px] resize-y"
                    {...field}
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
                  <Input placeholder="Your name" {...field} />
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
            {isSubmitting ? 'Creating...' : 'Create Article'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ArticleForm;
