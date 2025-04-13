
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarPlaylistProps {
  name: string;
  type: string;
  image?: string;
  icon?: React.ReactNode;
  count?: string;
  owner?: string;
  isLiked?: boolean;
  link?: string;
}

const SidebarPlaylist: React.FC<SidebarPlaylistProps> = ({ 
  name, 
  type, 
  image, 
  icon, 
  count, 
  owner, 
  isLiked,
  link
}) => {
  const content = (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group">
      <div className={`flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center 
        ${image ? '' : 'bg-zinc-700'} 
        ${isLiked ? 'bg-gradient-to-br from-purple-800 to-blue-300' : ''}`}
      >
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : icon ? (
          icon
        ) : (
          <span className="text-sm font-medium text-white">{name[0]}</span>
        )}
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-white truncate group-hover:text-orange-600 transition-colors">
          {name}
        </span>
        <div className="flex items-center text-xs text-spotify-text-secondary">
          <span className="truncate">
            {type}
            {owner && ` • ${owner}`}
            {count && ` • ${count}`}
          </span>
        </div>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className="block">
      {content}
    </Link>
  ) : (
    content
  );
};

export default SidebarPlaylist;
