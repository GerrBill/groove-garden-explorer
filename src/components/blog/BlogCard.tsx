
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { deleteBlogArticle } from '@/utils/blogUtils';
import { toast } from '@/hooks/use-toast';

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    setIsDeleting(true);
    
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) {
      setIsDeleting(false);
      return;
    }
    
    console.log("Delete clicked for article:", id);
    
    toast({
      title: "Deleting article...",
      description: "Please wait while we delete this article"
    });
    
    const success = await deleteBlogArticle(
      id,
      image,
      () => {
        // Call onDeleted callback to refresh the parent component's list
        if (onDeleted) {
          console.log("Calling onDeleted callback for main blog list refresh");
          onDeleted();
        }
      }
    );
    
    setIsDeleting(false);
  };

  return (
    <Link to={`/blog/${id}`} className="block">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {/* Card image */}
          <div className="aspect-video w-full overflow-hidden">
            {image ? (
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/lovable-uploads/90dc4b4f-9007-42c3-9243-928954690a7b.png';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <span className="text-2xl font-medium text-white">{title[0]}</span>
              </div>
            )}
          </div>
          
          {/* Category tag */}
          {category && (
            <div className="absolute top-2 left-2 bg-zinc-900/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              {category}
            </div>
          )}
          
          {/* Admin delete button */}
          {isAdmin && (
            <button 
              onClick={handleDelete}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-600/80 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              <Trash2 size={16} className={isDeleting ? 'opacity-50' : ''} />
            </button>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-base mb-1 line-clamp-2">{title}</h3>
          
          {excerpt && (
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
