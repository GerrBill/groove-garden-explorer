
import React from 'react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({
  currentTrack
}) => {
  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-zinc-500 text-sm">No track selected</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between h-full w-full">
      <div className="hidden md:block md:w-1/4 truncate pr-2">
        <p className="text-sm text-white font-semibold truncate">{currentTrack.title}</p>
        <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
      </div>
      <div className="flex-grow flex justify-center">
        <AudioPlayer 
          audioSrc={currentTrack.audio_path || ''} 
        />
      </div>
      <div className="hidden md:block md:w-1/4"></div>
    </div>
  );
};

export default PlayerContent;
