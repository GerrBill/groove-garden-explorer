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

  // Use a default image if none is provided
  const imgSrc = image || '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
  return <div className="bg-zinc-900 rounded-lg overflow-hidden w-full mb-8">
      <div className="flex flex-col md:flex-row">
        
        
        <div className="md:w-1/3">
          <div className="h-full">
            <img src={imgSrc} alt={title} className="w-full h-full object-cover object-center" onError={e => {
            // Fallback to default image if loading fails
            (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
          }} />
          </div>
        </div>
      </div>
    </div>;
};
export default FeaturedBlogPost;