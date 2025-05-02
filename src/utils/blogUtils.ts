
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
    console.log("Starting delete operation for article:", articleId);
    
    // Delete the comments first
    const { data: commentDeleteData, error: commentsError } = await supabase
      .from('blog_comments')
      .delete()
      .eq('article_id', articleId);
    
    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
      throw commentsError;
    }
    
    console.log("Comments deleted successfully", commentDeleteData);
    
    // Delete the article itself
    const { data: articleDeleteData, error: articleError } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', articleId);
    
    if (articleError) {
      console.error("Error deleting article:", articleError);
      throw articleError;
    }
    
    console.log("Article deleted successfully", articleDeleteData);
    
    toast({
      title: "Article deleted",
      description: "The article has been successfully deleted",
    });
    
    // Execute success callback if provided
    if (onSuccess) {
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
