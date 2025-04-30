
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Album } from '@/types/supabase';
import { ScrollArea } from "@/components/ui/scroll-area";

interface RelatedAlbumsProps {
  album: Album | null;
  isMobile: boolean;
}

const RelatedAlbums: React.FC<RelatedAlbumsProps> = ({ album, isMobile }) => {
  if (!album) return null;

  return (
    <div className="w-full px-6 pt-1 pb-2">
      <h3 className="text-xl font-bold mb-3">More by {album.artist}</h3>
      <ScrollArea className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2 items-center">
              <AspectRatio ratio={1/1} className="w-full overflow-hidden rounded-md">
                <img 
                  src={album.image_url} 
                  alt={`${album.artist} album ${i}`}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
              <div className="truncate text-sm font-medium text-center w-full">Related Album {i}</div>
              <div className="text-xs text-spotify-text-secondary text-center">{album.year}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RelatedAlbums;
