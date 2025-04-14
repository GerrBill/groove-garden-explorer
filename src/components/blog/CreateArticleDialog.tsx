
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ArticleForm from './ArticleForm';
import { uploadImageFile } from '@/utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";

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

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png'; // Default image
      
      // Upload image if provided
      if (values.imageFile) {
        console.log('Uploading image file:', values.imageFile.name);
        imageUrl = await uploadImageFile(values.imageFile, 'blog');
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // Generate excerpt if not provided (use first 150 chars of content)
      const excerpt = values.content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '')
        .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '$2')
        .substring(0, 150) + '...';
      
      // Insert article into database
      const { data, error } = await supabase
        .from('blog_articles')
        .insert({
          title: values.title,
          subtitle: values.subtitle || null,
          content: values.content,
          excerpt: excerpt,
          image_url: imageUrl,
          author: values.author,
          category: values.category,
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success!",
        description: "Your article has been published.",
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
        description: "Failed to create article. Please try again.",
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
        <DialogHeader>
          <DialogTitle>Create New Article</DialogTitle>
        </DialogHeader>
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
