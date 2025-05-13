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
import ResetPassword from "./pages/ResetPassword";
import Sidebar from "./components/sidebar/Sidebar";
import Player from "./components/player/Player";
import TopBar from "./components/navigation/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ToastProvider } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

  // Always force dark mode - this will be applied immediately and doesn't rely on ThemeProvider
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.setAttribute('data-color-theme', 'orange'); // Default color theme
  }, []);

  console.log("App rendered, routes should be active");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <TooltipProvider>
                <SidebarProvider defaultOpen={sidebarOpen}>
                  <div className="flex flex-col h-screen overflow-hidden bg-black text-foreground w-full">
                    <TopBar />
                    <div className="flex flex-grow relative">
                      {sidebarOpen && (
                        <div className="transition-all duration-300">
                          <Sidebar />
                        </div>
                      )}
                      <div className="flex flex-col flex-grow w-full">
                        <div className="flex-grow overflow-y-auto bg-black">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/album/:id" element={<Album />} />
                            <Route path="/playlists" element={<Playlists />} />
                            <Route path="/playlist/:id" element={<Playlist />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:id" element={<BlogPost />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                        <Player />
                      </div>
                    </div>
                  </div>
                  <Toaster />
                  <Sonner />
                </SidebarProvider>
              </TooltipProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
