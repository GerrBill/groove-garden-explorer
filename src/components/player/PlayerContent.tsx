
import React from 'react';
import { Volume2 } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ currentTrack }) => {
  return (
    <div className="flex items-center justify-between h-full px-4 gap-4">
      <div className="w-[30%] min-w-[200px] flex-shrink-0">
        {currentTrack && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-zinc-800 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-xs text-zinc-400">♪</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{currentTrack.title}</div>
              <div className="text-xs text-zinc-400 truncate">{currentTrack.artist}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow flex justify-center max-w-[600px]">
        <AudioPlayer track={currentTrack} />
      </div>
      
      <div className="w-[20%] min-w-[100px] flex justify-end flex-shrink-0">
        <Volume2 className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
      </div>
    </div>
  );
};

export default PlayerContent;
