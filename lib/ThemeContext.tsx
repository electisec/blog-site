"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Type definition for theme values
 */
type Theme = 'light' | 'dark';

/**
 * Interface for the theme context
 */
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create the context with undefined as default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component that manages theme state and provides it to children
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      // Check if theme is stored in localStorage
      const storedTheme = localStorage.getItem('theme') as Theme | null;

      if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
        setTheme(storedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    };

    // Run initialization
    initializeTheme();
  }, []);

  // Update document with theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Update document class for Tailwind
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Update data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to use the theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
