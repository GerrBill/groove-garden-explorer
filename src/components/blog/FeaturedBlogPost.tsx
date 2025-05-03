
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FeaturedBlogPostProps {
  id: string;
  image: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
}

const FeaturedBlogPost: React.FC<FeaturedBlogPostProps> = ({
  id,
  image,
  title,
  excerpt,
  author,
  date,
  category
}) => {
  // Format the date as "X days ago"
  const formattedDate = formatDistanceToNow(new Date(date), {
    addSuffix: true
  });

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden w-full mb-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <div className="h-full">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover object-center" 
              onError={e => {
                // Fallback to default image if loading fails
                (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
              }} 
            />
          </div>
        </div>
        
        <div className="md:w-2/3 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="inline-block bg-theme-color text-white text-xs px-2 py-1 rounded mb-2">
              {category}
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
              {title}
            </h2>
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {excerpt}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              <span>{author}</span>
              <span className="mx-2">•</span>
              <span>{formattedDate}</span>
            </div>
            
            <Button asChild variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-500/10">
              <Link to={`/blog/${id}`}>
                Read More <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlogPost;
