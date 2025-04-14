
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Load theme preference from Supabase or localStorage
  useEffect(() => {
    const loadThemePreference = async () => {
      // First check localStorage
      const storedTheme = localStorage.getItem('theme_preference');
      
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
      
      // Then try to get from Supabase if we have a userId
      if (userId) {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', userId)
          .single();
          
        if (!error && data && data.theme) {
          setTheme(data.theme);
          localStorage.setItem('theme_preference', data.theme);
        }
      }
    };
    
    loadThemePreference();
  }, [userId]);

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
          .update({ theme: newTheme, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            theme: newTheme
          });
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveThemePreference(newTheme);
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
