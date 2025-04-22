
import React from 'react';
import { Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import AddTrackDialog from './AddTrackDialog';
import { Track } from '@/types/supabase';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';

interface AlbumActionsProps {
  albumId?: string;
  onTrackAdded?: (track: Track) => void;
  updateAlbumArtDialog?: React.ReactNode;
  onDeleteAlbum?: () => void;
}

const ADMIN_EMAILS = [
  "wjparker@outlook.com",
  "ghodgett59@gmail.com"
];

const AlbumActions: React.FC<AlbumActionsProps> = ({ 
  albumId, 
  onTrackAdded, 
  updateAlbumArtDialog,
  onDeleteAlbum
}) => {
  const { user } = useAuth();
  const { colorTheme } = useTheme();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <button 
        className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-full hover:border-white hover:scale-105 transition text-theme-color"
        aria-label="Like album"
      >
        <Heart size={20} />
      </button>
      
      {isAdmin && (
        <div className="flex items-center gap-2">
          {albumId && (
            <AddTrackDialog 
              albumId={albumId} 
              onTrackAdded={onTrackAdded}
            />
          )}

          {updateAlbumArtDialog}

          {onDeleteAlbum && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onDeleteAlbum}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              Delete Album
            </Button>
          )}
        </div>
      )}
      
      <button 
        className="w-10 h-10 flex items-center justify-center hover:text-white ml-auto text-theme-color"
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
    </div>
  );
};

export default AlbumActions;
