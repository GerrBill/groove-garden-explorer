
import React from 'react';
import { Clock, MoreHorizontal, Heart } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  plays: string;
  duration: string;
  isPlaying?: boolean;
}

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  return (
    <div className="px-6 py-4">
      <div className="grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 border-b border-zinc-800 pb-2 mb-4 px-4 text-spotify-text-secondary text-sm">
        <div>#</div>
        <div>Title</div>
        <div className="hidden md:block">Plays</div>
        <div className="hidden md:block"></div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>
      
      {tracks.map((track) => (
        <div 
          key={track.id}
          className={`grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md text-sm hover:bg-white/5 group ${
            track.isPlaying ? 'text-spotify-accent' : 'text-spotify-text-primary'
          }`}
        >
          <div className="flex items-center">
            <span>{track.id}</span>
          </div>
          
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-0">
              <div className="font-medium truncate">{track.title}</div>
              <div className="text-spotify-text-secondary text-xs">{track.artist}</div>
            </div>
          </div>
          
          <div className="flex items-center text-spotify-text-secondary hidden md:block">
            {track.plays}
          </div>
          
          <div className="flex items-center justify-end">
            <button className="text-spotify-text-secondary opacity-0 group-hover:opacity-100 hover:text-white">
              <Heart size={16} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>{track.duration}</span>
            <button className="text-spotify-text-secondary opacity-0 group-hover:opacity-100 hover:text-white">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;
