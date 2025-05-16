
import React from 'react';
import TopNav from '@/components/navigation/TopNav';
import { ScrollArea } from "@/components/ui/scroll-area";

const Playlists = () => {
  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-black">
      <TopNav />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full bg-black">
        <div className="px-4 py-4 max-w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
          
          {/* Playlists content goes here */}
          <div className="text-center text-zinc-400 py-8">
            Playlist content coming soon...
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Playlists;
