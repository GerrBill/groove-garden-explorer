
import React from 'react';
import { Link } from 'react-router-dom';

interface Album {
  id: string;
  title: string;
  artist: string;
  image_url: string | null;
  created_at: string;
}

interface AlbumItemProps {
  album: Album;
}

const AlbumItem: React.FC<AlbumItemProps> = ({ album }) => {
  // Clean image URL if it's a blob URL or invalid
  const imageUrl = album.image_url && (album.image_url.startsWith('blob:') || !album.image_url.startsWith('http')) 
    ? '/placeholder.svg'  // Use placeholder if it's a blob URL or doesn't start with http
    : album.image_url || '/placeholder.svg';  // Fallback to placeholder if null

  return (
    <Link to={`/album/${album.id}`} className="block">
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group">
        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={album.title} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                console.log("Error loading image:", imageUrl);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <span className="text-sm font-medium text-white">{album.title[0]}</span>
          )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate group-hover:text-theme-color transition-colors">
            {album.title}
          </span>
          <div className="flex items-center text-xs text-spotify-text-secondary">
            <span className="truncate">
              Album • {album.artist}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlbumItem;
