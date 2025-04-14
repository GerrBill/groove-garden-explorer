
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  id: string;
  image: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  image,
  title,
  excerpt,
  author,
  date,
  category
}) => {
  // Format the date as "X days ago"
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  
  return (
    <Link to={`/blog/${id}`} className="group">
      <div className="bg-zinc-900 rounded-lg overflow-hidden h-full transition-all duration-300 hover:bg-zinc-800">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
          <div className="absolute top-2 left-2 bg-orange-700 text-white text-xs px-2 py-1 rounded-full">
            {category}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
            {excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{author}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
