
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
      // Delete the comments first
      const { error: commentsError } = await supabase
        .from('blog_comments')
        .delete()
        .eq('article_id', article.id);
      
      if (commentsError) throw commentsError;
      
      // Delete the image from storage if it exists
      if (article.image_url) {
        try {
          const imageUrl = new URL(article.image_url);
          const pathSegments = imageUrl.pathname.split('/');
          const publicIndex = pathSegments.indexOf('public');
          
          if (publicIndex !== -1 && publicIndex < pathSegments.length - 1) {
            const bucket = pathSegments[publicIndex + 1]; 
            const filePath = pathSegments.slice(publicIndex + 2).join('/');
            
            if (bucket && filePath) {
              await supabase.storage
                .from(bucket)
                .remove([filePath]);
            }
          }
        } catch (imageError) {
          console.error('Error parsing image URL:', imageError);
        }
      }
      
      // Delete the article itself
      const { error: articleError } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', article.id);
      
      if (articleError) throw articleError;
      
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
