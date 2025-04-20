
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
  const [trackDuration, setTrackDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const playRequestPending = useRef<boolean>(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Add event listeners for audio debugging
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log("Audio can play through");
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio error:", e);
      });
    }

    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const handleDurationChange = () => {
      if (audioRef.current) {
        setTrackDuration(audioRef.current.duration);
      }
    };

    const audio = audioRef.current;
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    
    // Listen for play track events
    const handlePlayTrack = (event: CustomEvent) => {
      const shouldPlayImmediately = event?.detail?.immediate === true;
      
      if (audioRef.current && hasAudio) {
        if (shouldPlayImmediately) {
          console.log("Playing track immediately due to tracklist play button");
          playAudio();
        } else {
          console.log("Track loaded but not auto-playing");
        }
      }
    };
    
    window.addEventListener('playTrack', handlePlayTrack as EventListener);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      window.removeEventListener('playTrack', handlePlayTrack as EventListener);
      audio.pause();
    };
  }, [hasAudio]);

  // Load new track when track prop changes
  useEffect(() => {
    if (track?.audio_path && audioRef.current) {
      console.log("Loading audio track:", track.title, track.audio_path);
      
      // Get audio URL from Supabase Storage
      const url = getAudioUrl(track.audio_path);
      console.log("Audio URL:", url);
      setAudioUrl(url);
      
      if (url) {
        // Stop current audio and load new one
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.crossOrigin = "anonymous"; // Add this for CORS issues
        setHasAudio(true);
        
        // Do NOT auto-play when a new track is loaded
        // Instead, set isPlaying to false and let the user press play
        setIsPlaying(false);
        
        // Load the audio but don't play it
        audioRef.current.load();
        
        // Check if audio is actually loaded
        audioRef.current.addEventListener('loadeddata', function onLoaded() {
          console.log("Audio loaded successfully");
          this.removeEventListener('loadeddata', onLoaded);
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

  // Play audio function that can be called from multiple places
  const playAudio = () => {
    if (!audioRef.current || !hasAudio || playRequestPending.current) return;
    
    console.log("Attempting to play audio");
    playRequestPending.current = true;
    setIsPlaying(true);
    
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Audio playing successfully");
          playRequestPending.current = false;
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
          playRequestPending.current = false;
          
          if (error.name !== 'AbortError') {
            toast({
              title: "Playback Error",
              description: "Could not play the audio file: " + error.message,
              variant: "destructive"
            });
          }
        });
    } else {
      playRequestPending.current = false;
    }
  };

  // Pause audio function
  const pauseAudio = () => {
    if (!audioRef.current || !hasAudio) return;
    console.log("Pausing audio");
    audioRef.current.pause();
    setIsPlaying(false);
    playRequestPending.current = false;
  };

  // Effect to actually play or pause the audio when isPlaying changes
  useEffect(() => {
    if (!audioRef.current || !hasAudio) return;
    
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, hasAudio]);

  const togglePlayPause = () => {
    if (!audioRef.current || !hasAudio) return;
    setIsPlaying(!isPlaying);
  };

  // Create a progress bar for audio playback
  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

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
            <div className="w-full bg-zinc-800 h-1 rounded-full mt-1">
              <div 
                className="bg-white h-1 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
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
