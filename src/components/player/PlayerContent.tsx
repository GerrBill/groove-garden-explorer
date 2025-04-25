
import React from 'react';
import { Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ currentTrack }) => {
  return (
    <div className="grid grid-cols-[300px_1fr_200px] gap-4 h-full items-center px-4">
      <div className="flex items-center min-w-0">
        {currentTrack && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-xs text-zinc-400">♪</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate max-w-[180px]">{currentTrack.title}</div>
              <div className="text-xs text-zinc-400 truncate max-w-[180px]">{currentTrack.artist}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center w-full">
        <AudioPlayer track={currentTrack} />
      </div>
      
      <div className="flex items-center justify-end">
        <Volume2 className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default PlayerContent;
