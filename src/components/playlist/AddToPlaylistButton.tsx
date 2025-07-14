
import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddToPlaylistButtonProps {
  trackId: string;
  albumName?: string;
}

interface Playlist {
  id: string;
  title: string;
}

const AddToPlaylistButton: React.FC<AddToPlaylistButtonProps> = ({ trackId, albumName }) => {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch available playlists when dialog opens
  useEffect(() => {
    if (open) {
      fetchPlaylists();
    }
  }, [open]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('id, title')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist) {
      toast({
        title: "Selection Required",
        description: "Please select a playlist first",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if track already exists in playlist
      const { data: existingTrack, error: checkError } = await supabase
        .from('playlist_tracks')
        .select('id')
        .eq('playlist_id', selectedPlaylist)
        .eq('track_id', trackId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingTrack) {
        toast({
          title: "Already Added",
          description: "This track is already in the selected playlist",
          variant: "default"
        });
        setOpen(false);
        return;
      }
      
      // Get current position/count of tracks in playlist
      const { count, error: countError } = await supabase
        .from('playlist_tracks')
        .select('id', { count: 'exact', head: true })
        .eq('playlist_id', selectedPlaylist);
      
      if (countError) throw countError;
      
      // Add track to playlist
      const { error: insertError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: selectedPlaylist,
          track_id: trackId,
          album_name: albumName || null,
          position: (count || 0) + 1
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Success",
        description: "Track added to playlist",
        variant: "default"
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      toast({
        title: "Error",
        description: "Failed to add track to playlist",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-zinc-400 hover:text-white"
        aria-label="Add to playlist"
      >
        <PlusCircle size={20} />
      </button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-700">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Select a playlist to add this track to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select
                value={selectedPlaylist}
                onValueChange={setSelectedPlaylist}
                disabled={loading || playlists.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a playlist" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                  {playlists.map((playlist) => (
                    <SelectItem key={playlist.id} value={playlist.id}>
                      {playlist.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddToPlaylist}
                disabled={loading || !selectedPlaylist}
              >
                {loading ? "Adding..." : "Add to Playlist"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToPlaylistButton;
