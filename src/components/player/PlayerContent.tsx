
import React from 'react';
import { Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ currentTrack }) => {
  return (
    <div className="flex items-center h-full px-4 md:px-6">
      <div className="w-[25%] max-w-[200px] min-w-[150px]">
        {currentTrack && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 bg-zinc-800 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-xs text-zinc-400">♪</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate max-w-[120px]">{currentTrack.title}</div>
              <div className="text-xs text-zinc-400 truncate max-w-[120px]">{currentTrack.artist}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow flex justify-center items-center">
        <AudioPlayer track={currentTrack} />
      </div>
      
      <div className="w-[15%] min-w-[60px] flex justify-end items-center">
        <Volume2 className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default PlayerContent;
