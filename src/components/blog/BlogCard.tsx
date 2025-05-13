
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { deleteBlogArticle } from '@/utils/blogUtils';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { isYouTubeUrl, extractYouTubeVideoId, isContentOnlyUrl } from '@/utils/youtubeUtils';
import YouTubeEmbed from '@/components/blog/YouTubeEmbed';

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

interface BlogCardProps {
  id: string;
  image?: string | null;
  title: string;
  excerpt?: string;
  author: string;
  date: string;
  category?: string;
  onDeleted?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  image,
  title,
  excerpt,
  author,
  date,
  category,
  onDeleted
}) => {
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });
  const { user } = useAuth();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  
  // Check if image is a YouTube URL
  const isYouTube = image ? isYouTubeUrl(image) : false;
  const youtubeId = isYouTube && image ? extractYouTubeVideoId(image) : null;
  
  // Check if excerpt is just a URL
  const shouldHideExcerpt = excerpt && isContentOnlyUrl(excerpt);

  // Removed handleDelete since we're removing the trash icon

  return (
    <Link to={`/blog/${id}`} className="block">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {/* Card image or YouTube embed */}
          <div className="aspect-video w-full overflow-hidden bg-zinc-800">
            {isYouTube && youtubeId ? (
              <YouTubeEmbed videoId={youtubeId} />
            ) : image && !imageError ? (
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                onError={(e) => {
                  console.error("Error loading image:", image);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-2xl font-medium text-white">{title[0].toUpperCase()}</span>
              </div>
            )}
          </div>
          
          {/* Category tag */}
          {category && (
            <div className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {category}
            </div>
          )}
          
          {/* Admin delete button removed */}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-2">{title}</h3>
          
          {excerpt && !shouldHideExcerpt && (
            <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
              {excerpt.replace(/<[^>]*>/g, '')}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{author}</span>
            <span>{formattedDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default BlogCard;
