
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ThemeType = 'dark' | 'light';
type ColorTheme = 'orange' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: ThemeType;
  colorTheme: ColorTheme;
  toggleTheme: () => void;
  setColorTheme: (color: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('orange');
  const [userId, setUserId] = useState<string | null>(null);

  // Get the user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('anonymous_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // Load theme preferences from localStorage first
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme_preference');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    }
    
    const storedColorTheme = localStorage.getItem('color_theme_preference');
    if (storedColorTheme === 'orange' || storedColorTheme === 'blue' || 
        storedColorTheme === 'green' || storedColorTheme === 'purple') {
      setColorTheme(storedColorTheme as ColorTheme);
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
    
    // Apply color theme to CSS variables
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [theme, colorTheme]);

  // Save theme preference
  const saveThemePreference = async (newTheme: ThemeType, newColorTheme: ColorTheme) => {
    localStorage.setItem('theme_preference', newTheme);
    localStorage.setItem('color_theme_preference', newColorTheme);
    
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
          // Update the record
          await supabase
            .from('user_preferences')
            .update({ 
              updated_at: new Date().toISOString() 
            })
            .eq('user_id', userId);
        } else {
          // Create a new record
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
    saveThemePreference(newTheme, colorTheme);
    toast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme applied`);
  };
  
  const handleSetColorTheme = (color: ColorTheme) => {
    setColorTheme(color);
    saveThemePreference(theme, color);
    toast(`${color.charAt(0).toUpperCase() + color.slice(1)} color theme applied`);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorTheme, 
      toggleTheme, 
      setColorTheme: handleSetColorTheme 
    }}>
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
