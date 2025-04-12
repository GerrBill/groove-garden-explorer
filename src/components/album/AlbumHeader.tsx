
import React from 'react';
import { Play, Shuffle, Heart, MoreHorizontal, Download } from 'lucide-react';

interface AlbumHeaderProps {
  image: string;
  title: string;
  artist: string;
  year: string;
  trackCount: string;
  duration: string;
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  image,
  title,
  artist,
  year,
  trackCount,
  duration
}) => {
  return (
    <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-zinc-700/40 to-spotify-background">
      <img 
        src={image} 
        alt={title} 
        className="w-56 h-56 shadow-xl object-cover" 
      />
      
      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium">Album</span>
        <h1 className="text-6xl font-bold">{title}</h1>
        
        <div className="flex items-center gap-1 text-sm">
          <img 
            src={image} 
            alt={artist} 
            className="w-6 h-6 rounded-full object-cover" 
          />
          <span className="font-medium hover:underline cursor-pointer">{artist}</span>
          <span className="text-spotify-text-secondary mx-1">•</span>
          <span className="text-spotify-text-secondary">{year}</span>
          <span className="text-spotify-text-secondary mx-1">•</span>
          <span className="text-spotify-text-secondary">{trackCount}</span>
          <span className="text-spotify-text-secondary mx-1">•</span>
          <span className="text-spotify-text-secondary">{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default AlbumHeader;
