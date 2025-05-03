
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
    
    // First verify that the article exists
    const { data: article, error: fetchError } = await supabase
      .from('blog_articles')
      .select('id')
      .eq('id', articleId)
      .single();
      
    if (fetchError || !article) {
      console.error("Error finding article:", fetchError);
      toast({
        title: "Error",
        description: "Could not find the article to delete",
        variant: "destructive"
      });
      return false;
    }
    
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
    
    // Delete the article itself
    const { error: articleError } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', articleId);
    
    if (articleError) {
      console.error("Error deleting article:", articleError);
      toast({
        title: "Error",
        description: "Failed to delete the article",
        variant: "destructive"
      });
      return false;
    }
    
    console.log("Article deleted successfully");
    
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
