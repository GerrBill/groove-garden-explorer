
import React from 'react';
import TopNav from '@/components/navigation/TopNav';
import { ScrollArea } from "@/components/ui/scroll-area";

const Blog = () => {
  return (
    <div className="flex-1 overflow-hidden w-full pb-24 bg-black">
      <TopNav />
      
      <ScrollArea className="h-[calc(100vh-140px)] w-full bg-black">
        <div className="px-4 py-4 max-w-full mx-auto">
          <h2 className="text-2xl font-bold mb-4">Blog Posts</h2>
          
          {/* Blog content goes here */}
          <div className="text-center text-zinc-400 py-8">
            Blog content coming soon...
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Blog;
