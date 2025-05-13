
import { supabase } from '@/integrations/supabase/client';
import { BlogArticle } from '@/types/supabase';
import { uploadImageFile } from './fileUpload';
import { isYouTubeUrl } from './youtubeUtils';

export interface ArticleFormData {
  title: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  category: string;
  author: string;
  imageFile?: File | null;
  youtubeVideoId?: string;
}

export const createBlogArticle = async (
  formData: ArticleFormData,
  onSuccess?: (data: any) => void
): Promise<boolean> => {
  try {
    console.log('Creating blog article with data:', formData);
    
    // Generate excerpt if not provided
    let excerpt = formData.excerpt;
    if (!excerpt) {
      // Strip HTML and get first 150 chars
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formData.content;
      const textContent = tempElement.textContent || tempElement.innerText;
      excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
    }
    
    // Process image: can be a File or a YouTube URL
    let imageUrl;
    
    // If we have a YouTube video ID, no need to upload an image
    if (formData.youtubeVideoId) {
      console.log('Using YouTube thumbnail for article image, video ID:', formData.youtubeVideoId);
      imageUrl = `https://img.youtube.com/vi/${formData.youtubeVideoId}/hqdefault.jpg`;
    } 
    // Otherwise try to upload the image file if provided
    else if (formData.imageFile) {
      console.log('Uploading image file for article:', formData.imageFile.name);
      imageUrl = await uploadImageFile(formData.imageFile, 'blog');
    } else {
      console.log('No image provided for article');
    }
    
    console.log('Final image URL for article:', imageUrl);
    
    // Insert the blog article into the database
    const { data, error } = await supabase
      .from('blog_articles')
      .insert({
        title: formData.title,
        subtitle: formData.subtitle || null,
        content: formData.content,
        excerpt: excerpt,
        image_url: imageUrl,
        author: formData.author,
        category: formData.category
      })
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log('Blog article created successfully:', data);
    
    // Call success callback if provided
    if (onSuccess && data) {
      onSuccess(data[0]);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating blog article:', error);
    return false;
  }
};

export const updateBlogArticle = async (
  id: string,
  formData: ArticleFormData,
  onSuccess?: (data: any) => void
): Promise<boolean> => {
  try {
    console.log('Updating blog article with ID:', id);
    console.log('Update data:', formData);
    
    // Generate excerpt if content changed
    let excerpt;
    if (formData.content) {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = formData.content;
      const textContent = tempElement.textContent || tempElement.innerText;
      excerpt = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
    }
    
    // Prepare update data
    const updateData: Partial<BlogArticle> = {
      title: formData.title,
      subtitle: formData.subtitle,
      content: formData.content,
      category: formData.category
    };
    
    // Add excerpt if generated
    if (excerpt) {
      updateData.excerpt = excerpt;
    }
    
    // Handle image update if provided
    if (formData.youtubeVideoId) {
      console.log('Updating with YouTube thumbnail, video ID:', formData.youtubeVideoId);
      updateData.image_url = `https://img.youtube.com/vi/${formData.youtubeVideoId}/hqdefault.jpg`;
    } else if (formData.imageFile) {
      console.log('Uploading new image for article update');
      updateData.image_url = await uploadImageFile(formData.imageFile, 'blog');
    }
    
    // Update the blog article
    const { data, error } = await supabase
      .from('blog_articles')
      .update(updateData)
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log('Blog article updated successfully:', data);
    
    // Call success callback if provided
    if (onSuccess && data) {
      onSuccess(data[0]);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating blog article:', error);
    return false;
  }
};

export const deleteBlogArticle = async (
  id: string,
  imageUrl?: string | null,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    console.log('Deleting blog article with ID:', id);
    
    // Delete the blog article
    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting blog article:', error);
      throw error;
    }
    
    console.log('Blog article deleted successfully');
    
    // If there's an image URL and it's from Supabase storage, delete it
    if (imageUrl && imageUrl.includes('supabase')) {
      try {
        // Extract the file path from the URL
        const filePathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (filePathMatch && filePathMatch.length === 3) {
          const bucketName = filePathMatch[1];
          const filePath = filePathMatch[2];
          
          console.log('Deleting associated image from storage:', bucketName, filePath);
          
          const { error: storageError } = await supabase
            .storage
            .from(bucketName)
            .remove([filePath]);
            
          if (storageError) {
            console.error('Error deleting image from storage:', storageError);
            // Don't throw, just log the error and continue
          } else {
            console.log('Associated image deleted successfully');
          }
        }
      } catch (storageError) {
        console.error('Error processing image deletion:', storageError);
        // Don't throw, just log the error and continue
      }
    }
    
    // Call success callback if provided
    if (onSuccess) {
      console.log('Calling onSuccess callback after successful deletion');
      onSuccess();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting blog article:', error);
    return false;
  }
};
