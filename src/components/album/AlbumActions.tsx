
import React from 'react';
import { Play, Heart, MoreHorizontal, Music } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import AddTrackDialog from './AddTrackDialog';

interface AlbumActionsProps {
  albumId?: string;
}

const AlbumActions: React.FC<AlbumActionsProps> = ({ albumId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="px-6 py-4 flex items-center gap-8">
      <button 
        className="w-14 h-14 flex items-center justify-center bg-spotify-accent rounded-full hover:scale-105 transition shadow-lg"
        aria-label="Play album"
      >
        <Play size={28} className="text-black ml-1" fill="black" />
      </button>
      
      <button 
        className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-full hover:border-white hover:scale-105 transition"
        aria-label="Like album"
      >
        <Heart size={20} />
      </button>
      
      {albumId && (
        <AddTrackDialog albumId={albumId} />
      )}
      
      <button 
        className="w-10 h-10 flex items-center justify-center hover:text-white ml-auto"
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};

export default AlbumActions;
