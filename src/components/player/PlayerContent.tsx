
import React from 'react';
import AudioPlayer from './AudioPlayer';
import { Track } from '@/types/supabase';

interface PlayerContentProps {
  currentTrack?: Track | null;
}

const PlayerContent: React.FC<PlayerContentProps> = ({
  currentTrack
}) => {
  return (
    <div className="flex items-center justify-center h-full px-4 md:px-0">
      <div className="w-[90%]">
        <AudioPlayer track={currentTrack} />
      </div>
    </div>
  );
};

export default PlayerContent;
