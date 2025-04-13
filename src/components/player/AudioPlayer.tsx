
import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Track } from '@/types/supabase';

interface AudioPlayerProps {
  track?: Track | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  useEffect(() => {
    if (track?.audio_path) {
      // In a real app, we would fetch from a server
      // For this demo, we'll get it from localStorage
      const storedAudio = localStorage.getItem(`audio_${track.audio_path}`);
      if (storedAudio) {
        setAudioSrc(storedAudio);
        
        // Stop current audio and load new one
        audio.pause();
        audio.src = storedAudio;
        
        // Auto-play when a new track is loaded
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        console.log("No audio found for path:", track.audio_path);
        setAudioSrc(null);
      }
    } else {
      setAudioSrc(null);
      audio.pause();
      setIsPlaying(false);
    }
    
    return () => {
      audio.pause();
    };
  }, [track, audio]);

  const togglePlayPause = () => {
    if (audioSrc) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
          disabled={!audioSrc}
        >
          <SkipBack size={16} />
        </button>
        
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-white hover:scale-105 transition ${!audioSrc ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={togglePlayPause}
          disabled={!audioSrc}
        >
          {isPlaying ? 
            <Pause size={20} className="text-black" fill="black" /> : 
            <Play size={20} className="text-black ml-1" fill="black" />
          }
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
          disabled={!audioSrc}
        >
          <SkipForward size={16} />
        </button>
      </div>
      
      <div className="flex flex-col min-w-0 flex-1 max-w-[160px]">
        {track ? (
          <>
            <div className="text-xs font-medium truncate">{track.title}</div>
            <div className="text-xs text-zinc-400 truncate">{track.artist}</div>
          </>
        ) : (
          <div className="text-xs text-zinc-400">No track selected</div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Volume2 size={18} className="text-zinc-400" />
      </div>
    </div>
  );
};

export default AudioPlayer;
