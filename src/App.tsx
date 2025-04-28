
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Album from "./pages/Album";
import Playlists from "./pages/Playlists";
import Playlist from "./pages/Playlist";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/sidebar/Sidebar";
import Player from "./components/player/Player";
import TopBar from "./components/navigation/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const isMobileView = useIsMobile(700); // Custom breakpoint at 700px

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('sidebar_visible');
    if (storedSidebarState !== null) {
      setSidebarOpen(storedSidebarState === 'true');
    }
  }, []);

  // Hide sidebar on mobile automatically
  useEffect(() => {
    if (isMobileView) {
      setSidebarOpen(false);
    } else {
      // On desktop, restore from localStorage or default to open
      const storedSidebarState = localStorage.getItem('sidebar_visible');
      if (storedSidebarState !== null) {
        setSidebarOpen(storedSidebarState === 'true');
      } else {
        setSidebarOpen(true);
      }
    }
  }, [isMobileView]);

  // Set up anonymous user ID
  useEffect(() => {
    const existingUserId = localStorage.getItem('anonymous_user_id');
    if (existingUserId) {
      setUserId(existingUserId);
    } else {
      const newUserId = `anon_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('anonymous_user_id', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Load user preferences from Supabase
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('sidebar_visible')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error loading preferences:', error);
        }
        return;
      }

      if (data && !isMobileView) {
        setSidebarOpen(data.sidebar_visible);
        localStorage.setItem('sidebar_visible', data.sidebar_visible.toString());
      }
    };

    loadUserPreferences();
  }, [userId, isMobileView]);

  // Toggle sidebar and save preferences
  const toggleSidebar = async () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    
    localStorage.setItem('sidebar_visible', newState.toString());
    
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
        await supabase
          .from('user_preferences')
          .update({ sidebar_visible: newState, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            sidebar_visible: newState
          });
      }
    }
  };

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  console.log("App rendered, routes should be active");

  // Update the useEffect for mobile view
  useEffect(() => {
    const handleResize = () => {
      const isMobileWidth = window.innerWidth < 700;
      setSidebarOpen(!isMobileWidth);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider defaultOpen={sidebarOpen}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground w-full">
                  <TopBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                  <div className="flex flex-grow relative">
                    {sidebarOpen && (
                      <div className="transition-all duration-300">
                        <Sidebar />
                      </div>
                    )}
                    <div className="flex flex-col flex-grow w-full">
                      <div className="flex-grow overflow-y-auto">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/album/:id" element={<Album />} />
                          <Route path="/playlists" element={<Playlists />} />
                          <Route path="/playlist/:id" element={<Playlist />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/blog/:id" element={<BlogPost />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                      {!window.location.pathname.includes('/blog') && <Player />}
                    </div>
                  </div>
                </div>
              </BrowserRouter>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
