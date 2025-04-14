
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

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

const BlogItem: React.FC<BlogItemProps> = ({ article }) => {
  // Format the date as "X days ago"
  const formattedDate = formatDistanceToNow(new Date(article.published_at), { addSuffix: true });
  
  return (
    <Link to={`/blog/${article.id}`} className="block">
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group">
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
          {article.image_url ? (
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">{article.title[0]}</span>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate group-hover:text-orange-600 transition-colors">
            {article.title}
          </span>
          <div className="flex items-center text-xs text-spotify-text-secondary">
            <span className="truncate">
              {article.category || 'Blog'} • {article.author} • {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogItem;
