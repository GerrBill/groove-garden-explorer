
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a blog article and its associated comments
 * @param articleId The ID of the article to delete
 * @param imageUrl Unused parameter, kept for backward compatibility
 * @param onSuccess Callback function to execute upon successful deletion
 */
export const deleteBlogArticle = async (
  articleId: string,
  imageUrl?: string | null,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    console.log("Starting delete operation for article ID:", articleId);
    
    // Delete the comments first to avoid foreign key constraints
    const { error: commentsError } = await supabase
      .from('blog_comments')
      .delete()
      .eq('article_id', articleId);
    
    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
      toast({
        title: "Error",
        description: "Failed to delete associated comments",
        variant: "destructive"
      });
      return false;
    }
    
    console.log("Comments deleted successfully");
    
    // Delete the article with proper error handling
    const { error: deleteError } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', articleId);
    
    if (deleteError) {
      console.error("Error deleting article:", deleteError);
      toast({
        title: "Error",
        description: `Failed to delete the article: ${deleteError.message}`,
        variant: "destructive"
      });
      return false;
    }
    
    // Successfully deleted
    console.log("Article deleted successfully");
    toast({
      title: "Article deleted",
      description: "The article has been successfully deleted",
    });
    
    // Execute success callback if provided
    if (onSuccess) {
      console.log("Executing onSuccess callback");
      onSuccess();
    }
    
    return true;
    
  } catch (error) {
    console.error('Error deleting article:', error);
    toast({
      title: "Error",
      description: "Failed to delete the article",
      variant: "destructive"
    });
    return false;
  }
};
