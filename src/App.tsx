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

// Initialize QueryClient with error logging
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
  },
});

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const isMobileView = useIsMobile(700); // Custom breakpoint at 700px
  const [appLoaded, setAppLoaded] = useState(false);

  console.log("App component rendering...");

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    try {
      console.log("Loading sidebar state from localStorage");
      const storedSidebarState = localStorage.getItem('sidebar_visible');
      if (storedSidebarState !== null) {
        setSidebarOpen(storedSidebarState === 'true');
      }
      
      // Mark app as loaded
      setAppLoaded(true);
    } catch (e) {
      console.error("Error loading sidebar state:", e);
      // Continue with default values
      setAppLoaded(true);
    }
  }, []);

  // Hide sidebar on mobile automatically
  useEffect(() => {
    try {
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
    } catch (e) {
      console.error("Error adjusting sidebar for mobile:", e);
    }
  }, [isMobileView]);

  // Set up anonymous user ID
  useEffect(() => {
    try {
      console.log("Setting up anonymous user ID");
      const existingUserId = localStorage.getItem('anonymous_user_id');
      if (existingUserId) {
        setUserId(existingUserId);
      } else {
        const newUserId = `anon_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('anonymous_user_id', newUserId);
        setUserId(newUserId);
      }
    } catch (e) {
      console.error("Error setting up anonymous user:", e);
    }
  }, []);

  // Always force dark mode - this will be applied immediately and doesn't rely on ThemeProvider
  useEffect(() => {
    try {
      console.log("Forcing dark mode");
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-color-theme', 'orange'); // Default color theme
    } catch (e) {
      console.error("Error setting theme:", e);
    }
  }, []);

  console.log("App rendered, routes should be active, appLoaded:", appLoaded);

  if (!appLoaded) {
    return <div className="h-screen w-full flex items-center justify-center bg-black text-white">
      <p>Loading application...</p>
    </div>;
  }

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
