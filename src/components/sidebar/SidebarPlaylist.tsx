
import React from 'react';
import { Link } from 'react-router-dom';

export interface Playlist {
  id: string;
  title: string;
  owner: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

interface SidebarPlaylistProps {
  playlists: Playlist[];
}

const SidebarPlaylist: React.FC<SidebarPlaylistProps> = ({ playlists }) => {
  return (
    <div className="space-y-1">
      {playlists.map((playlist) => (
        <Link to={`/playlist/${playlist.id}`} key={playlist.id} className="block">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-900 cursor-pointer group">
            <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-zinc-700">
              {playlist.image_url ? (
                <img src={playlist.image_url} alt={playlist.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-white">{playlist.title[0]}</span>
              )}
            </div>
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate group-hover:text-orange-600 transition-colors">
                {playlist.title}
              </span>
              <div className="flex items-center text-xs text-spotify-text-secondary">
                <span className="truncate">
                  Playlist • {playlist.owner}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SidebarPlaylist;
