
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ArticleForm from './ArticleForm';
import { uploadImageFile, imageToBase64 } from '@/utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from '@tanstack/react-query';

interface CreateArticleDialogProps {
  children: React.ReactNode;
}

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  imageFile?: File | null;
}

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({
  children
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = '/placeholder.svg'; // Default image

      // Upload image if provided
      if (values.imageFile) {
        console.log('Processing image file:', values.imageFile.name, 'Size:', values.imageFile.size, 'Type:', values.imageFile.type);
        
        // Validate file type
        if (!values.imageFile.type.startsWith('image/')) {
          throw new Error('Invalid file type. Only images are allowed.');
        }
        
        // Validate file size (max 5MB)
        if (values.imageFile.size > 5 * 1024 * 1024) {
          throw new Error('File too large. Maximum size is 5MB.');
        }
        
        try {
          // Upload to Supabase Storage and get URL
          imageUrl = await uploadImageFile(values.imageFile, 'blog');
          console.log('Image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Failed to upload image to storage:', error);
          toast({
            title: "Image Upload Issue",
            description: "Continuing with placeholder image",
            variant: "destructive"
          });
          imageUrl = '/placeholder.svg';
        }
      } else {
        console.log('No image file provided, using default');
      }

      // Generate excerpt if not provided (use first 150 chars of content)
      const excerpt = values.content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '')
        .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '$2')
        .substring(0, 150) + '...';

      console.log('Creating article with image URL:', imageUrl);

      // Insert article into database
      const { data, error } = await supabase.from('blog_articles').insert({
        title: values.title,
        subtitle: values.subtitle || null,
        content: values.content,
        excerpt: excerpt,
        image_url: imageUrl,
        author: values.author || 'Anonymous',
        category: values.category
      }).select('id').single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-blogs'] });
      
      toast({
        title: "Success!",
        description: "Your article has been published."
      });
      
      setOpen(false);

      // Navigate to the newly created article
      if (data && data.id) {
        navigate(`/blog/${data.id}`);
      } else {
        // Refresh the blog page to show the new article
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "Error",
        description: `Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <ScrollArea className="max-h-[calc(80vh-120px)] overflow-auto pr-4">
          <ArticleForm 
            isSubmitting={isSubmitting} 
            onSubmit={handleSubmit} 
            onCancel={() => setOpen(false)} 
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleDialog;
