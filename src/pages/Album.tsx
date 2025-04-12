
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AlbumHeader from '@/components/album/AlbumHeader';
import TrackList from '@/components/album/TrackList';
import { Play, Shuffle, Heart, MoreHorizontal, ChevronLeft, ChevronRight, User } from 'lucide-react';

const mockTracks = [
  {
    id: 1,
    title: "Dolemite",
    artist: "Scott Henderson",
    plays: "2,729,027",
    duration: "5:52",
    isPlaying: false
  },
  {
    id: 2,
    title: "Tore Down House",
    artist: "Scott Henderson",
    plays: "1,357,843",
    duration: "7:37",
    isPlaying: true
  },
  {
    id: 3,
    title: "Meter Maid",
    artist: "Scott Henderson",
    plays: "259,503",
    duration: "4:29",
    isPlaying: false
  },
  {
    id: 4,
    title: "I Hate You",
    artist: "Scott Henderson",
    plays: "277,539",
    duration: "4:38",
    isPlaying: false
  },
  {
    id: 5,
    title: "Gittar School",
    artist: "Scott Henderson",
    plays: "182,525",
    duration: "5:10",
    isPlaying: false
  }
];

const Album = () => {
  const { id } = useParams();
  
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="sticky top-0 z-10 backdrop-blur-md bg-transparent pt-4">
        <div className="flex justify-between items-center px-6 mb-4">
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
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
      
      <AlbumHeader 
        image="/lovable-uploads/139e8005-e704-48e4-8b89-b9bc1a1e47ae.png"
        title="Tore Down House"
        artist="Scott Henderson"
        year="1997"
        trackCount="11 songs"
        duration="1 hr 3 min"
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
      
      <TrackList tracks={mockTracks} />
    </div>
  );
};

export default Album;
