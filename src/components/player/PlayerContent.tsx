
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
          <div className="flex items-center gap-3 ml-3">
            <div className="w-10 h-10 bg-zinc-800 rounded"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center items-center">
        <AudioPlayer track={currentTrack} />
      </div>
      
      <div className="flex items-center justify-end">
        {/* Right side controls can go here */}
      </div>
    </div>
  );
};

export default PlayerContent;
