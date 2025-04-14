
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
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  
  // Use a default image if none is provided
  const imgSrc = image || '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
  
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden w-full mb-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col">
          <div className="mb-4">
            <span className="bg-orange-700 text-white text-xs px-2 py-1 rounded-full">
              {category}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
          <p className="text-zinc-400 mb-6">{excerpt}</p>
          
          <div className="flex items-center justify-between mb-6 text-sm text-zinc-500">
            <span>{author}</span>
            <span>{formattedDate}</span>
          </div>
          
          <div className="mt-auto">
            <Button asChild className="bg-orange-700 hover:bg-orange-800 text-white">
              <Link to={`/blog/${id}`} className="flex items-center gap-2">
                Read Article <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <div className="h-full">
            <img 
              src={imgSrc} 
              alt={title} 
              className="w-full h-full object-cover object-center" 
              onError={(e) => {
                // Fallback to default image if loading fails
                (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBlogPost;
