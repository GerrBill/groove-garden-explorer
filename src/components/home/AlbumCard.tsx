
import React from 'react';
import { Play } from 'lucide-react';

interface AlbumCardProps {
  image: string;
  title: string;
  artist: string;
  size?: 'sm' | 'md' | 'lg';
}

const AlbumCard: React.FC<AlbumCardProps> = ({ 
  image, 
  title, 
  artist,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-36',
    md: 'w-44',
    lg: 'w-52',
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-spotify-card bg-opacity-40 p-4 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer`}>
      <div className="relative mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full aspect-square object-cover rounded shadow-md" 
        />
        <button className="absolute bottom-2 right-2 w-10 h-10 bg-spotify-accent rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg">
          <Play size={20} className="text-black ml-0.5" fill="black" />
        </button>
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
      <p className="text-xs text-spotify-text-secondary mt-1 line-clamp-2">{artist}</p>
    </div>
  );
};

export default AlbumCard;
