
import React from 'react';
import { Play, Heart, MoreHorizontal, Music } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface AlbumActionsProps {
  albumId?: string;
}

const AlbumActions: React.FC<AlbumActionsProps> = ({ albumId }) => {
  const navigate = useNavigate();
  
  const handleAddTracks = () => {
    // Navigate to add tracks page or show modal (future implementation)
    console.log("Add tracks to album", albumId);
    // For now, just show a toast message
    alert("Add tracks functionality will be implemented soon!");
  };
  
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
      
      <Button 
        onClick={handleAddTracks}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700"
        size="sm"
      >
        <Music size={16} />
        Add Tracks
      </Button>
      
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
