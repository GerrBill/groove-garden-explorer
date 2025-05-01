
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Deletes a blog article and its associated resources (comments and image)
 * @param articleId The ID of the article to delete
 * @param imageUrl Optional image URL to delete
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
    const { error: commentsError } = await supabase
      .from('blog_comments')
      .delete()
      .eq('article_id', articleId);
    
    if (commentsError) {
      console.error("Error deleting comments:", commentsError);
      throw commentsError;
    }
    
    console.log("Comments deleted successfully");
    
    // Delete the image from storage if it exists and is from Supabase
    if (imageUrl && imageUrl.includes('supabase.co/storage')) {
      try {
        console.log("Attempting to delete image:", imageUrl);
        
        // Extract the path from the URL
        // Format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
        const storageMatch = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        
        if (storageMatch && storageMatch.length >= 3) {
          const bucket = storageMatch[1];
          const filePath = storageMatch[2];
          
          console.log("Parsed image data:", { bucket, filePath });
          
          const { error: storageError, data } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (storageError) {
            console.error("Error deleting image from storage:", storageError);
            // Continue with article deletion even if image deletion fails
          } else {
            console.log("Image deleted successfully:", data);
          }
        } else {
          console.log("Image URL doesn't match expected Supabase storage pattern");
        }
      } catch (imageError) {
        console.error('Error parsing or deleting image:', imageError);
        // Continue with article deletion even if image deletion fails
      }
    }
    
    // Delete the article itself
    const { error: articleError } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', articleId);
    
    if (articleError) {
      console.error("Error deleting article:", articleError);
      throw articleError;
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
