
import React from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AlbumCardProps {
  image: string;
  title: string;
  artist: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ 
  image, 
  title, 
  artist,
  size = 'md',
  id
}) => {
  const sizeClasses = {
    sm: 'w-36 xs:w-32',
    md: 'w-44 sm:w-40 xs:w-36',
    lg: 'w-52 sm:w-48 xs:w-40',
  };
  
  const content = (
    <>
      <div className="relative mb-4">
        <AspectRatio ratio={1/1} className="overflow-hidden rounded shadow-md">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </AspectRatio>
        <button 
          className="absolute bottom-2 right-2 w-10 h-10 bg-orange-700 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg"
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to parent Link
        >
          <Play size={20} className="text-white ml-0.5" fill="white" />
        </button>
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
      <p className="text-xs text-spotify-text-secondary mt-1 line-clamp-2">{artist}</p>
    </>
  );
  
  if (id) {
    return (
      <Link 
        to={`/album/${id}`} 
        className={`${sizeClasses[size]} bg-spotify-card bg-opacity-40 p-4 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer`}
        aria-label={`View album ${title}`}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-spotify-card bg-opacity-40 p-4 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer`}>
      {content}
    </div>
  );
};

export default AlbumCard;
