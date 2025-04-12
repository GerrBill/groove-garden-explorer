
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Album as AlbumType, Track as TrackType } from '@/types/supabase';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/album/TrackList';
import { Play, Heart, MoreHorizontal, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [album, setAlbum] = useState<AlbumType | null>(null);
  const [tracks, setTracks] = useState<TrackType[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function fetchAlbumData() {
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
        
        setAlbum(albumData);
        setTracks(tracksData);
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
    }

    if (id) {
      fetchAlbumData();
    }
  }, [id, toast]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleToggleLike = async (trackId: string) => {
    const trackIndex = tracks.findIndex(track => track.id === trackId);
    if (trackIndex === -1) return;

    const updatedTracks = [...tracks];
    const newLikedStatus = !updatedTracks[trackIndex].is_liked;
    updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], is_liked: newLikedStatus };
    
    setTracks(updatedTracks);
    
    try {
      const { error } = await supabase
        .from('tracks')
        .update({ is_liked: newLikedStatus })
        .eq('id', trackId);
        
      if (error) throw error;
      
      toast({
        title: newLikedStatus ? "Added to Liked Songs" : "Removed from Liked Songs",
        duration: 2000
      });
    } catch (error) {
      console.error('Error updating track:', error);
      // Revert the optimistic update
      updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], is_liked: !newLikedStatus };
      setTracks(updatedTracks);
    }
  };

  // Convert tracks to the format expected by TrackList component
  const formattedTracks = tracks.map(track => ({
    id: track.track_number,
    title: track.title,
    artist: track.artist,
    plays: track.plays.toLocaleString(),
    duration: track.duration,
    isLiked: track.is_liked,
    trackId: track.id
  }));

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-transparent pt-4">
        <div className="flex justify-between items-center px-6 mb-4">
          <div className="flex gap-2">
            <button 
              className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full"
              onClick={handleGoBack}
            >
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
              <ChevronRight size={18} />
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-black rounded-full py-1 px-1 pr-3 hover:bg-zinc-800">
            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center">
              <User size={14} />
            </div>
            <span className="text-sm font-medium">Profile</span>
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spotify-accent"></div>
        </div>
      ) : album ? (
        <div className={`flex ${isMobile ? 'flex-col' : 'md:flex-row'} gap-6`}>
          <div className="flex-1">
            <AlbumHeader 
              image={album.image_url}
              title={album.title}
              artist={album.artist}
              year={album.year || ""}
              trackCount={album.track_count || `${tracks.length} songs`}
              duration={album.duration || ""}
            />
            
            <div className="px-6 py-4 flex items-center gap-8">
              <button className="w-14 h-14 flex items-center justify-center bg-spotify-accent rounded-full hover:scale-105 transition shadow-lg">
                <Play size={28} className="text-black ml-1" fill="black" />
              </button>
              
              <button className="w-10 h-10 flex items-center justify-center border border-zinc-700 rounded-full hover:border-white hover:scale-105 transition">
                <Heart size={20} />
              </button>
              
              <button className="w-10 h-10 flex items-center justify-center hover:text-white">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <TrackList 
              tracks={formattedTracks} 
              onToggleLike={handleToggleLike}
            />
          </div>
          
          {/* Related albums section - Will be displayed below on mobile */}
          <div className={`${isMobile ? 'w-full mt-8 px-6' : 'w-80'} shrink-0`}>
            <h3 className="text-xl font-bold mb-4">More by {album.artist}</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <AspectRatio ratio={1/1} className="overflow-hidden rounded-md">
                    <img 
                      src={album.image_url} 
                      alt={`${album.artist} album ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <div className="truncate text-sm font-medium">Related Album {i}</div>
                  <div className="text-xs text-spotify-text-secondary">{album.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl text-spotify-text-secondary">Album not found</p>
          <button 
            className="mt-4 px-6 py-2 bg-spotify-accent rounded-full text-black font-medium"
            onClick={handleGoBack}
          >
            Go back
          </button>
        </div>
      )}
    </div>
  );
};

export default Album;
