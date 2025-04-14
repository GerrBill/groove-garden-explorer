
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ThemeType = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [userId, setUserId] = useState<string | null>(null);

  // Get the user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('anonymous_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Load theme preference from localStorage first
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme_preference');
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save theme preference
  const saveThemePreference = async (newTheme: ThemeType) => {
    localStorage.setItem('theme_preference', newTheme);
    
    // Only try to save to Supabase if we have a userId
    if (userId) {
      try {
        // First check if the user_preferences record already exists
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
          // We need to use user_preferences without trying to update a non-existent 'theme' column
          // Instead, we'll just update the other preferences and maintain the theme in localStorage only
          await supabase
            .from('user_preferences')
            .update({ 
              updated_at: new Date().toISOString() 
            })
            .eq('user_id', userId);
        } else {
          // Create a new record without the theme column
          await supabase
            .from('user_preferences')
            .insert({
              user_id: userId
            });
        }
      } catch (err) {
        console.error('Error saving theme preference:', err);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveThemePreference(newTheme);
    toast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme applied`);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
