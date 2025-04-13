
import React from 'react';
import { Clock, MoreHorizontal, Heart, Play } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  plays: string | number;
  duration: string;
  isPlaying?: boolean;
  isLiked?: boolean;
  trackId: string;
}

interface TrackListProps {
  tracks: Track[];
  onToggleLike?: (trackId: string) => void;
  onPlayTrack?: (trackId: string) => void;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onToggleLike, onPlayTrack }) => {
  // Debug output to check tracks data
  console.log('TrackList rendering with tracks:', tracks);
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 border-b border-zinc-800 pb-2 mb-4 px-4 text-spotify-text-secondary text-sm">
        <div>#</div>
        <div>Title</div>
        <div className="hidden md:block">Plays</div>
        <div className="hidden md:block"></div>
        <div className="flex justify-end">
          <Clock size={16} />
        </div>
      </div>
      
      {tracks && tracks.length > 0 ? (
        <div className="space-y-1 mb-8">
          {tracks.map((track, index) => (
            <div 
              key={track.id || `track-${index}`}
              className={`grid grid-cols-[16px_6fr_4fr_3fr_1fr] gap-4 px-4 py-2 rounded-md text-sm hover:bg-white/5 group ${
                track.isPlaying ? 'text-spotify-accent' : 'text-spotify-text-primary'
              }`}
            >
              <div className="flex items-center">
                <span className="group-hover:hidden">{index + 1}</span>
                <button 
                  className="hidden group-hover:flex items-center justify-center"
                  onClick={() => onPlayTrack && track.trackId && onPlayTrack(track.trackId)}
                >
                  <Play size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="min-w-0">
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-spotify-text-secondary text-xs">{track.artist}</div>
                </div>
              </div>
              
              <div className="flex items-center text-spotify-text-secondary hidden md:flex">
                {typeof track.plays === 'number' ? track.plays.toLocaleString() : track.plays}
              </div>
              
              <div className="flex items-center justify-end">
                <button 
                  className={`${track.isLiked ? 'text-spotify-accent' : 'text-spotify-text-secondary'} ${!track.isLiked ? 'opacity-0 group-hover:opacity-100' : ''} hover:text-white`}
                  onClick={() => onToggleLike && track.trackId && onToggleLike(track.trackId)}
                >
                  <Heart size={16} fill={track.isLiked ? 'currentColor' : 'none'} />
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
      ) : (
        <div className="py-8 text-center text-spotify-text-secondary mb-16">
          No tracks available for this album. Add some tracks!
        </div>
      )}
    </div>
  );
};

export default TrackList;
