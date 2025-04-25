import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
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

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
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

  useEffect(() => {
    if (track?.audio_path && audioRef.current) {
      console.log("Loading audio track:", track.title, track.audio_path);
      
      const url = getAudioUrl(track.audio_path);
      console.log("Audio URL:", url);
      setAudioUrl(url);
      
      if (url) {
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.crossOrigin = "anonymous";
        setHasAudio(true);
        
        setIsPlaying(false);
        
        audioRef.current.load();
        
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

  const pauseAudio = () => {
    if (!audioRef.current || !hasAudio) return;
    console.log("Pausing audio");
    audioRef.current.pause();
    setIsPlaying(false);
    playRequestPending.current = false;
  };

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

  const progress = trackDuration > 0 ? (currentTime / trackDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-4">
        <button 
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          disabled={!hasAudio}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button 
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-white hover:scale-105 transition-all ${!hasAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={togglePlayPause}
          disabled={!hasAudio}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-black" />
          ) : (
            <Play className="w-5 h-5 text-black ml-1" />
          )}
        </button>
        
        <button 
          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          disabled={!hasAudio}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
      
      {track && (
        <div className="w-full flex flex-col gap-1">
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor(trackDuration / 60)}:{Math.floor(trackDuration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
