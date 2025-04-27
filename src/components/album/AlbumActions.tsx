
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

const ADMIN_EMAILS = ["wjparker@outlook.com", "ghodgett59@gmail.com"];

const AlbumActions: React.FC<AlbumActionsProps> = ({
  albumId,
  onTrackAdded,
  updateAlbumArtDialog,
  onDeleteAlbum
}) => {
  const {
    user
  } = useAuth();
  const {
    colorTheme
  } = useTheme();
  
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");
  
  return (
    <div className="flex items-center gap-4 py-4">
      {isAdmin && albumId && onTrackAdded && (
        <AddTrackDialog 
          albumId={albumId}
          onTrackAdded={onTrackAdded}
        />
      )}
      
      {updateAlbumArtDialog}
      
      {isAdmin && onDeleteAlbum && (
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
  );
};

export default AlbumActions;
