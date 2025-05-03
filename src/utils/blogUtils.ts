
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
    
    // Use the database function to delete the article and its comments
    const { data, error } = await supabase.rpc(
      'delete_blog_article',
      { article_id_param: articleId }
    );
    
    if (error) {
      console.error("Error using delete_blog_article RPC:", error);
      toast({
        title: "Error",
        description: `Failed to delete the article: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
    
    // If the function returned true, deletion was successful
    if (data === true) {
      console.log("Article deleted successfully via RPC function");
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
    } else {
      console.error("Article deletion failed: RPC function returned false");
      toast({
        title: "Error",
        description: "Failed to delete the article. It may not exist.",
        variant: "destructive"
      });
      return false;
    }
    
  } catch (error) {
    console.error('Error in deleteBlogArticle:', error);
    toast({
      title: "Error",
      description: "Failed to delete the article due to an unexpected error",
      variant: "destructive"
    });
    return false;
  }
};
