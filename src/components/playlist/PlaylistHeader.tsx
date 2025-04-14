
import React from 'react';

interface PlaylistHeaderProps {
  title: string;
  description: string | null;
  imageUrl: string | null;
  owner: string;
  trackCount: number;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  title,
  description,
  imageUrl,
  owner,
  trackCount
}) => {
  return (
    <div className="px-6 pt-6 pb-4 flex items-end gap-6 bg-gradient-to-b from-orange-950/40 to-zinc-900">
      <div className="w-48 h-48 shadow-lg flex-shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <span className="text-4xl font-bold text-zinc-600">
              {title[0]}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className="uppercase text-sm font-medium mb-2">Playlist</span>
        <h1 className="text-5xl font-bold mb-6">{title}</h1>
        
        {description && (
          <p className="text-sm text-zinc-400 mb-2">{description}</p>
        )}
        
        <div className="flex items-center text-sm text-zinc-400">
          <span className="font-medium">{owner}</span>
          <span className="mx-1">•</span>
          <span>{trackCount} {trackCount === 1 ? 'song' : 'songs'}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaylistHeader;
