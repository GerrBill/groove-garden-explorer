
import React from 'react';

interface SidebarPlaylistProps {
  name: string;
  image?: string;
  type: string;
  count?: string;
  owner?: string;
  isLiked?: boolean;
  icon?: React.ReactNode;
}

const SidebarPlaylist: React.FC<SidebarPlaylistProps> = ({ 
  name, 
  image, 
  type, 
  count, 
  owner,
  isLiked,
  icon
}) => {
  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-zinc-800 cursor-pointer">
      {isLiked ? (
        <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-300 flex items-center justify-center rounded">
          {icon}
        </div>
      ) : image ? (
        <img 
          src={image} 
          alt={name} 
          className="w-12 h-12 flex-shrink-0 object-cover rounded" 
        />
      ) : (
        <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 flex items-center justify-center rounded">
          <span className="text-xs text-zinc-400">{name.substring(0, 2)}</span>
        </div>
      )}
      
      <div className="overflow-hidden">
        <p className="text-sm font-medium text-spotify-text-primary truncate">{name}</p>
        <div className="flex items-center text-xs text-spotify-text-secondary">
          {type && <span>{type}</span>}
          {count && <span> • {count}</span>}
          {owner && <span> • {owner}</span>}
        </div>
      </div>
    </div>
  );
};

export default SidebarPlaylist;
