
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
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  const imgSrc = image || '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';

  // Responsive: 70vw width for mobile, artwork adjusted for compact cards
  return (
    <Link to={`/blog/${id}`} className="group mx-auto min-w-[70vw] max-w-[70vw] sm:min-w-0 sm:max-w-xs block">
      <div className="bg-zinc-900 rounded-lg overflow-hidden h-full transition-all duration-300 hover:bg-zinc-800">
        <div className="relative aspect-[16/8] overflow-hidden" style={{ maxHeight: '110px' }}>
          <img 
            src={imgSrc} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 max-h-[110px]" 
            onError={(e) => {
              console.error("Error loading image in BlogCard:", imgSrc);
              (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
            }}
          />
          <div className="absolute top-2 left-2 bg-theme-color text-white text-xs px-2 py-1 rounded-full">
            {category}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-theme-color transition-colors">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
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
