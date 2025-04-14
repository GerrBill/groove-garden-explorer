
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Track } from '@/types/supabase';
import { getAudioUrl } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  track?: Track | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const audio = audioRef.current;
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (track?.audio_path && audioRef.current) {
      console.log("Loading audio track:", track.title, track.audio_path);
      
      // Get audio URL from Supabase Storage
      const url = getAudioUrl(track.audio_path);
      setAudioUrl(url);
      
      if (url) {
        // Stop current audio and load new one
        audioRef.current.pause();
        audioRef.current.src = url;
        setHasAudio(true);
        
        // Auto-play when a new track is loaded
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          toast({
            title: "Now Playing",
            description: `${track.title} by ${track.artist}`,
          });
        }).catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
      } else {
        console.log("No audio URL found for path:", track.audio_path);
        setHasAudio(false);
        toast({
          title: "Playback Error",
          description: "Could not load the audio file",
          variant: "destructive"
        });
      }
    } else {
      setHasAudio(false);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [track, toast]);

  const togglePlayPause = () => {
    if (!audioRef.current || !hasAudio) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        toast({
          title: "Playback Error",
          description: "Could not play the audio file",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 bg-transparent">
      <div className="flex items-center gap-1">
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
          disabled={!hasAudio}
        >
          <SkipBack size={16} />
        </button>
        
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-white hover:scale-105 transition ${!hasAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={togglePlayPause}
          disabled={!hasAudio}
        >
          {isPlaying ? 
            <Pause size={20} className="text-black" fill="black" /> : 
            <Play size={20} className="text-black ml-1" fill="black" />
          }
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
          disabled={!hasAudio}
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
