
import React from 'react';
import { Play } from 'lucide-react';

interface FeaturedCardProps {
  image: string;
  title: string;
  description: string;
  type: string;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  image,
  title,
  description,
  type,
}) => {
  return (
    <div className="flex items-stretch bg-gradient-to-r from-zinc-800/70 to-zinc-900/30 rounded-lg h-72 overflow-hidden relative cursor-pointer group">
      <div className="w-2/3 p-6 flex flex-col justify-between z-10">
        <div>
          <span className="text-xs text-white bg-black/40 px-2 py-1 rounded">
            {type}
          </span>
          <h2 className="text-4xl font-bold mt-4 mb-2">{title}</h2>
          <p className="text-sm text-spotify-text-secondary">{description}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="bg-spotify-accent text-black rounded-full py-3 px-8 font-bold hover:scale-105 transition">
            Play
          </button>
          <button className="border border-white/30 text-white rounded-full py-3 px-8 font-bold hover:border-white transition">
            Follow
          </button>
        </div>
      </div>
      
      <div className="absolute right-0 top-0 h-full w-2/5">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/80 to-transparent"></div>
      </div>
    </div>
  );
};

export default FeaturedCard;
