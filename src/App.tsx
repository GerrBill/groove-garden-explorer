
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
import TopBar from "./components/navigation/TopBar";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  console.log("App rendered, routes should be active"); // Debug: Check if App component renders

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col h-screen overflow-hidden bg-spotify-background text-spotify-text-primary">
            <TopBar />
            <div className="flex flex-grow">
              <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300`}>
                <Sidebar />
              </div>
              <div className="flex flex-col flex-grow w-full">
                <button 
                  onClick={toggleSidebar}
                  className="fixed top-12 left-4 z-30 bg-zinc-900 rounded-full p-2 shadow-lg"
                  aria-label={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                >
                  {sidebarOpen ? 
                    <ChevronLeft size={20} className="text-orange-700" /> : 
                    <ChevronRight size={20} className="text-orange-700" />
                  }
                </button>
                <div className="flex-grow overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/album/:id" element={<Album />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Player />
              </div>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
