
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
  const sizeClasses = {
    sm: 'w-full',
    md: 'w-full',
    lg: 'w-full',
  };
  
  // Separate handler for the play button to prevent navigation through Link
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;
    
    try {
      // Get the first track of the album
      const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('track_number', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      
      if (tracks && tracks.length > 0) {
        const firstTrack = tracks[0] as Track;
        
        // Navigate to album detail page
        navigate(`/${type}/${id}`);
        
        // Use a small timeout to ensure the album page is loaded before we try to play
        setTimeout(() => {
          // Dispatch event to play the track
          window.dispatchEvent(new CustomEvent('trackSelected', { detail: firstTrack }));
        }, 300);
      } else {
        // If no tracks, just navigate to the album page
        navigate(`/${type}/${id}`);
      }
    } catch (error) {
      console.error('Error fetching first track:', error);
      // Fallback to just navigation
      navigate(`/${type}/${id}`);
    }
  };
  
  // Content to display in the card
  const content = (
    <>
      <div className="relative mb-1">
        <AspectRatio ratio={1/1} className="overflow-hidden rounded shadow-md">
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
  
  if (id) {
    return (
      <Link 
        to={`/${type}/${id}`} 
        className={`${sizeClasses[size]} block bg-spotify-card bg-opacity-40 p-1 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer`}
        aria-label={`View ${type} ${title}`}
        onClick={handleCardClick}
        data-testid={`${type}-card-${id}`}
      >
        {content}
      </Link>
    );
  }
  
  return (
    <div className={`${sizeClasses[size]} bg-spotify-card bg-opacity-40 p-1 rounded-md hover:bg-opacity-70 transition-all group cursor-pointer`}>
      {content}
    </div>
  );
};

export default AlbumCard;
