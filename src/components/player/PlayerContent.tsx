
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
    <div className="flex items-center justify-center h-full w-full">
      <AudioPlayer 
        audioSrc={currentTrack.audio_path || ''} 
        trackTitle={currentTrack.title || 'Unknown Track'} 
        trackArtist={currentTrack.artist || 'Unknown Artist'} 
      />
    </div>
  );
};

export default PlayerContent;
