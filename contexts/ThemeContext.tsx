import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
    try {
        const storedTheme = localStorage.getItem('app_theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
    } catch (error) {
        console.error('Error reading theme from localStorage:', error);
    }
    // Default to system preference if available, otherwise 'light'
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);

    try {
        localStorage.setItem('app_theme', theme);
    } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};