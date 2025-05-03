
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a blog article and its associated comments
 * @param articleId The ID of the article to delete
 * @param imageUrl Optional image URL associated with the article
 * @param onSuccess Callback function to execute upon successful deletion
 */
export const deleteBlogArticle = async (
  articleId: string,
  imageUrl?: string | null,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    console.log("Starting delete operation for article ID:", articleId);
    
    // First, verify that the article actually exists before attempting deletion
    const { data: articleExists, error: checkError } = await supabase
      .from('blog_articles')
      .select('id')
      .eq('id', articleId)
      .single();
    
    if (checkError || !articleExists) {
      console.error("Article not found or error checking existence:", checkError);
      toast({
        title: "Error",
        description: "Article could not be found. It may no longer exist.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if comments exist before attempting to delete them
    const { data: comments, error: commentsCheckError } = await supabase
      .from('blog_comments')
      .select('id')
      .eq('article_id', articleId);
      
    if (commentsCheckError) {
      console.error("Error checking for comments:", commentsCheckError);
      // Continue with article deletion even if comment check fails
    }
    
    // Only try to delete comments if they exist
    if (comments && comments.length > 0) {
      console.log(`Found ${comments.length} comments to delete`);
      
      const { error: commentsError } = await supabase
        .from('blog_comments')
        .delete()
        .eq('article_id', articleId);
      
      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        // Log the error but continue with article deletion
      } else {
        console.log("Comments deleted successfully");
      }
    } else {
      console.log("No comments found for this article");
    }
    
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
    if (onSuccess && typeof onSuccess === 'function') {
      console.log("Executing onSuccess callback");
      onSuccess();
    }
    
    return true;
    
  } catch (error) {
    console.error('Error deleting article:', error);
    toast({
      title: "Error",
      description: "Failed to delete the article due to an unexpected error",
      variant: "destructive"
    });
    return false;
  }
};
