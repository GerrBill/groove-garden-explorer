
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Album from "./pages/Album";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/sidebar/Sidebar";
import Player from "./components/player/Player";
import TopBar from "./components/navigation/TopBar";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize sidebar visibility from local storage first (for immediate UI feedback)
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebar_visible');
    if (storedSidebarState !== null) {
      setSidebarOpen(storedSidebarState === 'true');
    }
  }, []);

  // Generate a unique ID for anonymous users to save preferences
  useEffect(() => {
    // Use existing ID from local storage or create a new one
    const existingUserId = localStorage.getItem('anonymous_user_id');
    if (existingUserId) {
      setUserId(existingUserId);
    } else {
      const newUserId = `anon_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('anonymous_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Load user preferences from database
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('sidebar_visible')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error loading preferences:', error);
        }
        return;
      }

      if (data) {
        setSidebarOpen(data.sidebar_visible);
        localStorage.setItem('sidebar_visible', data.sidebar_visible.toString());
      }
    };

    loadUserPreferences();
  }, [userId]);

  const toggleSidebar = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    // Store in local storage for immediate persistence across page reloads
    localStorage.setItem('sidebar_visible', newState.toString());
    
    // Store in database for persistence across devices
    if (userId) {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for existing preferences:', error);
        return;
      }
      
      if (data) {
        // Update existing record
        await supabase
          .from('user_preferences')
          .update({ sidebar_visible: newState, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        // Insert new record
        await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            sidebar_visible: newState
          });
      }
    }
  };

  console.log("App rendered, routes should be active"); // Debug: Check if App component renders

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col h-screen overflow-hidden bg-spotify-background text-spotify-text-primary">
            <TopBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-grow">
              <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
                <Sidebar />
              </div>
              <div className="flex flex-col flex-grow w-full">
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
