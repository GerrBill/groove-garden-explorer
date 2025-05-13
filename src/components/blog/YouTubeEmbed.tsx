
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface YouTubeEmbedProps {
  videoId: string;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, className = "" }) => {
  return (
    <div className={`w-full ${className}`}>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </AspectRatio>
    </div>
  );
};

export default YouTubeEmbed;
