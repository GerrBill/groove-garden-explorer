
import React from 'react';
import { Heart, MoreHorizontal } from 'lucide-react';
import AddTrackDialog from './AddTrackDialog';
import { Track } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';

interface AlbumActionsProps {
  albumId?: string;
  onTrackAdded?: (track: Track) => void;
  updateAlbumArtDialog?: React.ReactNode;
}

const AlbumActions: React.FC<AlbumActionsProps> = ({ albumId, onTrackAdded, updateAlbumArtDialog }) => {
  const { user } = useAuth();
  
  return (
    <div className="px-6 py-4 flex items-center gap-8">
      <button 
        className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-full hover:border-white hover:scale-105 transition"
        aria-label="Like album"
      >
        <Heart size={20} />
      </button>
      
      {/* Only show Add Track and Update Album Art buttons to logged-in users */}
      {user && (
        <div className="flex items-center gap-2">
          {albumId && (
            <AddTrackDialog 
              albumId={albumId} 
              onTrackAdded={onTrackAdded}
            />
          )}
          
          {updateAlbumArtDialog}
        </div>
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
