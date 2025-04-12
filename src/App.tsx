
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Album from "./pages/Album";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/sidebar/Sidebar";
import Player from "./components/player/Player";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden bg-spotify-background text-spotify-text-primary">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/album/:id" element={<Album />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Player />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
