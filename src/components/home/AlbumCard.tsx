
import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface AlbumCardProps {
  image: string;
  title: string;
  artist: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  type?: 'album' | 'playlist';
}

const AlbumCard: React.FC<AlbumCardProps> = ({ 
  image, 
  title, 
  artist,
  size = 'md',
  id,
  type = 'album'
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean image URL if it's a blob URL
  const imageUrl = image && image.startsWith('blob:') 
    ? '/placeholder.svg'  // Use placeholder if it's a blob URL
    : image || '/placeholder.svg';  // Fallback to placeholder if null

  // Responsive sizing for the card container
  const sizeClasses = {
    sm: 'w-full max-w-[300px]',
    md: 'w-full max-w-[320px]',
    lg: 'w-full max-w-[360px]',
  };
  
  // Artwork size adjustments - smaller for mobile
  const artworkSize = "w-full max-w-[200px] h-auto aspect-square rounded shadow-md object-cover mx-auto";

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;

    try {
      // Fetch the first track from the album/playlist
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true })
        .limit(1);
        
      if (error) throw error;
      
      if (tracks && tracks.length > 0) {
        const firstTrack = tracks[0] as Track;
        
        // First navigate to the album/playlist page to ensure proper context
        navigate(`/${type}/${id}`);
        
        // Then immediately play the track
        setIsPlaying(true);
        
        // Dispatch the event to select and play the track
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trackSelected', { detail: firstTrack }));
          // Immediately trigger play after track selection
          window.dispatchEvent(new CustomEvent('playTrack', { 
            detail: { immediate: true }
          }));
        }, 100);
      } else {
        navigate(`/${type}/${id}`);
        toast({ 
          title: "No tracks found",
          description: `This ${type} doesn't have any tracks yet.`,
        });
      }
    } catch (error) {
      console.error('Error fetching first track:', error);
      navigate(`/${type}/${id}`);
    }
  };

  // Content to display in the card
  const content = (
    <>
      <div className="relative mb-2 flex justify-center">
        <AspectRatio ratio={1/1} className="w-full overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className={artworkSize}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </AspectRatio>
        <button 
          className="absolute bottom-1 right-1 w-8 h-8 bg-theme-color rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg"
          onClick={handlePlayClick}
          aria-label={`Play ${type}`}
        >
          <Play size={16} className="text-white ml-0.5" fill="white" />
        </button>
      </div>
      <h3 className="font-medium text-xs line-clamp-1">{title}</h3>
      <p className="text-xs text-spotify-text-secondary mt-0.5 line-clamp-2">{artist}</p>
    </>
  );

  // Handle navigation when the card is clicked
  const handleCardClick = () => {
    if (id) {
      console.log(`Navigating to ${type}/${id}`);
    }
  };

  // Card container with proper margins and mobile width
  if (id) {
    return (
      <Link 
        to={`/${type}/${id}`} 
        className={`block bg-black p-3 rounded-md hover:bg-black hover:bg-opacity-70 transition-all group cursor-pointer mx-auto my-4 ${sizeClasses[size]} min-w-[70vw] max-w-[70vw] sm:min-w-0 sm:max-w-[320px]`}
        aria-label={`View ${type} ${title}`}
        onClick={handleCardClick}
        data-testid={`${type}-card-${id}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`bg-black p-3 rounded-md hover:bg-black hover:bg-opacity-70 transition-all group cursor-pointer mx-auto my-4 ${sizeClasses[size]} min-w-[70vw] max-w-[70vw] sm:min-w-0 sm:max-w-[320px]`}>
      {content}
    </div>
  );
};

export default AlbumCard;
