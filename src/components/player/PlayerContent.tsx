
import React from 'react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ currentTrack }) => {
  return (
    <div className="grid grid-cols-3 h-full">
      <div className="flex items-center justify-start">
        {currentTrack && (
          <div className="flex items-center gap-3 ml-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center">
              <span className="text-xs text-zinc-400">♪</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium truncate max-w-[150px]">{currentTrack.title}</div>
              <div className="text-xs text-zinc-400 truncate max-w-[150px]">{currentTrack.artist}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center items-center w-full">
        <AudioPlayer track={currentTrack} />
      </div>
      
      <div className="flex items-center justify-end mr-4">
        <Volume2 className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default PlayerContent;
