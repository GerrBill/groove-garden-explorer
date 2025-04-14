
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import ArticleForm from './ArticleForm';
import { uploadImageFile } from '@/utils/fileUpload';
import { useNavigate } from 'react-router-dom';
import { BlogArticle } from '@/types/supabase';

interface EditArticleDialogProps {
  children: React.ReactNode;
  article: BlogArticle;
  onArticleUpdated?: () => void;
}

interface ArticleFormValues {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  author: string;
  imageFile?: File | null;
}

const EditArticleDialog: React.FC<EditArticleDialogProps> = ({ 
  children, 
  article,
  onArticleUpdated 
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values: ArticleFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = article.image_url; // Keep existing image by default
      
      // Upload new image if provided
      if (values.imageFile) {
        console.log('Uploading new image file:', values.imageFile.name);
        imageUrl = await uploadImageFile(values.imageFile, 'blog');
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // Generate excerpt if content changed (use first 150 chars of content)
      const excerpt = values.content
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '')
        .replace(/<div style="text-align: (left|center|right);">(.*?)<\/div>/g, '$2')
        .substring(0, 150) + '...';
      
      // Update article in database
      const { error } = await supabase
        .from('blog_articles')
        .update({
          title: values.title,
          subtitle: values.subtitle || null,
          content: values.content,
          excerpt: excerpt,
          image_url: imageUrl,
          category: values.category,
          // Don't update author
        })
        .eq('id', article.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success!",
        description: "Your article has been updated.",
      });
      
      setOpen(false);

      // Call callback if provided
      if (onArticleUpdated) {
        onArticleUpdated();
      }
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: "Failed to update article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert the article data to form values
  const articleToFormValues = (): ArticleFormValues => {
    return {
      title: article.title,
      subtitle: article.subtitle || '',
      content: article.content,
      category: article.category,
      author: article.author,
      imageFile: null,
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Article</DialogTitle>
          <DialogDescription>
            Make changes to your article below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ArticleForm 
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          initialValues={articleToFormValues()}
          imageUrl={article.image_url}
          isEditing={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditArticleDialog;
