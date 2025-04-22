
import React from 'react';
import { Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from '@/integrations/supabase/client';
import { Track } from '@/types/supabase';

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

  // Responsive width classes: 70% (max-w-xs) on mobile 
  // Use a parent "flex justify-center" in grid for true centering (see page)
  const sizeClasses = {
    sm: 'w-full max-w-[300px] aspect-square',
    md: 'w-full max-w-[320px] aspect-square',
    lg: 'w-full max-w-[360px] aspect-square',
  };
  // Artwork aspect ratio and size tweaks (smaller for mobile)
  const artworkSize = "aspect-square rounded shadow-md w-full h-auto max-w-[260px] max-h-[260px] sm:max-w-[240px] sm:max-h-[240px] object-cover";

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    try {
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true })
        .limit(1);
      if (error) throw error;
      if (tracks && tracks.length > 0) {
        const firstTrack = tracks[0] as Track;
        navigate(`/${type}/${id}`);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trackSelected', { detail: firstTrack }));
        }, 300);
      } else {
        navigate(`/${type}/${id}`);
      }
    } catch (error) {
      console.error('Error fetching first track:', error);
      navigate(`/${type}/${id}`);
    }
  };

  // Content to display in the card
  const content = (
    <>
      <div className="relative mb-1 flex justify-center">
        <AspectRatio ratio={1/1} className={artworkSize + " overflow-hidden"}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </AspectRatio>
        <button 
          className="absolute bottom-1 right-1 w-8 h-8 bg-orange-700 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg"
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

  // Center cards and set 70% width for mobile (max-w-xs~288px)
  // Added my-2.5 for top and bottom margin (10px)
  if (id) {
    return (
      <Link 
        to={`/${type}/${id}`} 
        className={`block bg-spotify-card bg-opacity-40 p-1 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer mx-auto my-2.5 ${sizeClasses[size]} min-w-[70vw] max-w-[70vw] sm:min-w-0 sm:max-w-[320px]`}
        aria-label={`View ${type} ${title}`}
        onClick={handleCardClick}
        data-testid={`${type}-card-${id}`}
        style={{ minWidth: '70vw', maxWidth: '70vw' }} // For 70% width on <sm
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`bg-spotify-card bg-opacity-40 p-1 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer mx-auto my-2.5 ${sizeClasses[size]} min-w-[70vw] max-w-[70vw] sm:min-w-0 sm:max-w-[320px]`} style={{ minWidth: '70vw', maxWidth: '70vw' }}>
      {content}
    </div>
  );
};

export default AlbumCard;
