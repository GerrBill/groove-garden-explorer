
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface BlogArticle {
  id: string;
  title: string;
  excerpt?: string;
  author: string;
  image_url?: string | null;
  published_at: string;
  category?: string;
}

interface BlogItemProps {
  article: BlogArticle;
}

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const BlogItem: React.FC<BlogItemProps> = ({ article }) => {
  // Format the date as "X days ago"
  const formattedDate = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
      return;
    }
    
    try {
      console.log("Starting delete operation for article:", article.id);
      
      // Delete the comments first
      const { error: commentsError } = await supabase
        .from('blog_comments')
        .delete()
        .eq('article_id', article.id);
      
      if (commentsError) {
        console.error("Error deleting comments:", commentsError);
        throw commentsError;
      }
      
      console.log("Comments deleted successfully");
      
      // Delete the image from storage if it exists
      if (article.image_url && article.image_url.includes('supabase.co')) {
        try {
          console.log("Attempting to delete image:", article.image_url);
          
          // Extract the bucket name and file path from the URL
          const urlParts = article.image_url.split('/storage/v1/object/public/');
          if (urlParts.length > 1) {
            const pathParts = urlParts[1].split('/', 1);
            const bucket = pathParts[0];
            const filePath = urlParts[1].substring(bucket.length + 1);
            
            console.log("Parsed image data:", { bucket, filePath });
            
            if (bucket && filePath) {
              const { error: storageError, data } = await supabase.storage
                .from(bucket)
                .remove([filePath]);
              
              if (storageError) {
                console.error("Error deleting image from storage:", storageError);
              } else {
                console.log("Image deleted successfully:", data);
              }
            }
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
        .eq('id', article.id);
      
      if (articleError) {
        console.error("Error deleting article:", articleError);
        throw articleError;
      }
      
      console.log("Article deleted successfully");
      
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted",
      });
      
      // Force sidebar refresh by reloading the page
      window.location.href = '/blog';
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete the article",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Link to={`/blog/${article.id}`} className="block">
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group relative">
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
          {article.image_url ? (
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">{article.title[0]}</span>
          )}
        </div>
        
        <div className="flex flex-col min-w-0 pr-6">
          <span className="text-sm font-medium text-white truncate group-hover:text-orange-600 transition-colors">
            {article.title}
          </span>
          <div className="flex items-center text-xs text-spotify-text-secondary">
            <span className="truncate">
              {article.category || 'Blog'} • {article.author} • {formattedDate}
            </span>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleDelete}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-opacity"
            aria-label="Delete article"
          >
            <Trash2 size={16} className="text-white" />
          </button>
        )}
      </div>
    </Link>
  );
};

export default BlogItem;
