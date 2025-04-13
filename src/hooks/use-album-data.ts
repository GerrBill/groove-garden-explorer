
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType, Track as TrackType } from '@/types/supabase';
import { useToast } from "@/components/ui/use-toast";

export function useAlbumData(id: string | undefined) {
  const { toast } = useToast();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [tracks, setTracks] = useState<TrackType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbumData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Fetch album data
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', id)
        .single();

      if (albumError) throw albumError;
      
      // Fetch tracks for this album
      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true });

      if (tracksError) throw tracksError;
      
      console.log('Fetched tracks:', tracksData);
      
      setAlbum(albumData);
      setTracks(tracksData || []);
    } catch (error) {
      console.error('Error fetching album data:', error);
      toast({
        title: "Error",
        description: "Failed to load album data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  return { album, tracks, loading, setTracks, refetch: fetchAlbumData };
}
