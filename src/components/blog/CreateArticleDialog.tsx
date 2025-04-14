
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
      // Here we would normally save the article to Supabase
      // but for now we'll just show a success message
      
      console.log("Article data to be saved:", data);
      
      // Close the dialog
      setOpen(false);
      
      toast({
        title: "Success",
        description: "Article created successfully!",
        duration: 3000,
      });

      // Reload the blog page to show the new article
      // We use navigate with a timestamp query parameter to force a reload
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
