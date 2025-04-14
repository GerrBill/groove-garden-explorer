
import React, { useState } from 'react';
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
import { FileText, Image as ImageIcon, Bold, Italic, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ArticleForm from './ArticleForm';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { uploadImageFile } from '@/utils/fileUpload';

interface CreateArticleDialogProps {
  children?: React.ReactNode;
}

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Process the image file if it exists
      let imageUrl = null;
      if (data.imageFile) {
        try {
          // Generate a unique ID for the image
          const imageId = crypto.randomUUID();
          imageUrl = await uploadImageFile(data.imageFile, imageId);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Error",
            description: "Failed to upload image. Using placeholder image instead.",
            variant: "destructive",
          });
          // Use a placeholder image if upload fails
          imageUrl = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
        }
      } else {
        // Use a placeholder image if no image was provided
        imageUrl = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
      }

      // Create excerpt from content if not provided
      const excerpt = data.subtitle || data.content?.substring(0, 150) + '...' || 'No content provided';
      
      // Save the article to Supabase
      const { data: articleData, error } = await supabase
        .from('blog_articles')
        .insert({
          title: data.title,
          subtitle: data.subtitle || null,
          content: data.content,
          excerpt: excerpt,
          image_url: imageUrl,
          author: data.author || (user?.email?.split('@')[0] || 'Anonymous'),
          category: data.category || 'Uncategorized',
          published_at: new Date().toISOString()
        })
        .select();

      if (error) {
        throw error;
      }
      
      console.log("Article saved successfully:", articleData);
      
      // Close the dialog
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Article created successfully!",
        duration: 3000,
      });

      // Reload the blog page to show the new article
      navigate('/blog?refresh=' + Date.now());
    } catch (error) {
      console.error("Error creating article:", error);
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
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
      <DialogContent className="sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto py-4">
        <DialogHeader className="py-2">
          <DialogTitle className="text-xl">Create New Article</DialogTitle>
          <DialogDescription className="text-sm">
            Fill in the details for your new article. Add a compelling title, image, and content.
          </DialogDescription>
        </DialogHeader>
        
        <ArticleForm 
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleDialog;
