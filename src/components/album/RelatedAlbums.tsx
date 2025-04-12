
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Album } from '@/types/supabase';

interface RelatedAlbumsProps {
  album: Album | null;
  isMobile: boolean;
}

const RelatedAlbums: React.FC<RelatedAlbumsProps> = ({ album, isMobile }) => {
  if (!album) return null;

  return (
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
  );
};

export default RelatedAlbums;
