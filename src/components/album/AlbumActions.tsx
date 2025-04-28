
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
  const { user } = useAuth();
  const { colorTheme } = useTheme();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email ?? "");

  return (
    <div className="flex items-center gap-4 mt-4 mb-6">
      {isAdmin && albumId && (
        <>
          <AddTrackDialog 
            albumId={albumId} 
            onTrackAdded={onTrackAdded}
          />
          
          {updateAlbumArtDialog}
          
          {onDeleteAlbum && (
            <Button 
              variant="outline"
              size="sm" 
              className="w-10 h-10 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-100/10"
              onClick={onDeleteAlbum}
              aria-label="Delete Album"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default AlbumActions;
