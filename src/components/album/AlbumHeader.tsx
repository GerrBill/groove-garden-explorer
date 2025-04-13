
import React from 'react';
import { Play, Shuffle, Heart, MoreHorizontal, Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AlbumHeaderProps {
  image: string;
  title: string;
  artist: string;
  year: string;
  trackCount: string;
  duration: string;
}

const AlbumHeader: React.FC<AlbumHeaderProps> = ({
  image,
  title,
  artist,
  year,
  trackCount,
  duration
}) => {
  const isMobile = useIsMobile(768); // Use the useIsMobile hook with a breakpoint of 768px

  return (
    <div className="bg-gradient-to-b from-zinc-700/40 to-spotify-background p-4 md:p-6 w-full">
      {isMobile ? (
        // Mobile layout - everything centered properly
        <div className="w-full flex flex-col items-center text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          
          {/* Center the album art properly with fixed dimensions */}
          <div className="flex justify-center w-full mb-4">
            <div className="w-[250px] h-[250px] flex justify-center items-center">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full shadow-xl object-cover" 
              />
            </div>
          </div>
          
          <div className="w-full flex flex-col items-center mt-4 gap-2">
            <div className="flex items-center gap-1 text-xs sm:text-sm">
              <img 
                src={image} 
                alt={artist} 
                className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" 
              />
              <span className="font-medium hover:underline cursor-pointer">{artist}</span>
              {year && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{year}</span>
                </>
              )}
              {trackCount && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{trackCount}</span>
                </>
              )}
              {duration && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Desktop layout - horizontal alignment
        <div className="flex items-end gap-6">
          <div>
            <img 
              src={image} 
              alt={title} 
              className="w-48 md:w-56 h-auto shadow-xl object-cover" 
            />
          </div>
          
          <div className="flex flex-col gap-2 md:gap-4">
            <span className="text-xs font-medium">Album</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">{title}</h1>
            
            <div className="flex items-center gap-1 text-xs sm:text-sm mt-1">
              <img 
                src={image} 
                alt={artist} 
                className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" 
              />
              <span className="font-medium hover:underline cursor-pointer">{artist}</span>
              {year && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{year}</span>
                </>
              )}
              {trackCount && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{trackCount}</span>
                </>
              )}
              {duration && (
                <>
                  <span className="text-spotify-text-secondary mx-1">•</span>
                  <span className="text-spotify-text-secondary">{duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumHeader;
