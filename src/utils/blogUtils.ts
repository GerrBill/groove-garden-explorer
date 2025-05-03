
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
    
    // First verify that the article exists before attempting deletion
    let { data: articleBefore, error: fetchError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', articleId)
      .single();
      
    if (fetchError) {
      console.error("Error finding article:", fetchError);
      toast({
        title: "Error",
        description: "Could not find the article to delete",
        variant: "destructive"
      });
      return false;
    }
    
    console.log("Found article to delete:", articleBefore);
    
    // Delete the comments first
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
    
    // Delete the article
    const { error: deleteError } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', articleId);
    
    if (deleteError) {
      console.error("Error deleting article:", deleteError);
      toast({
        title: "Error",
        description: "Failed to delete the article",
        variant: "destructive"
      });
      return false;
    }
    
    // Verify that the article was actually deleted
    const { data: articleAfter, error: verifyError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', articleId)
      .maybeSingle();
    
    if (verifyError) {
      console.error("Error verifying deletion:", verifyError);
    } else if (articleAfter) {
      console.error("Article still exists after deletion attempt:", articleAfter);
      toast({
        title: "Error",
        description: "Article deletion failed - article still exists",
        variant: "destructive"
      });
      return false;
    } else {
      console.log("Article deletion verified - article no longer exists in database");
    }
    
    // Successfully deleted
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
