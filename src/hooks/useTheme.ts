import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Force clear any existing dark theme setting and always start with light
    localStorage.setItem('theme', 'light');
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Force remove dark theme class and ensure light theme
    root.classList.remove('dark');
    root.classList.add('light');
    
    // Ensure localStorage is always set to light
    localStorage.setItem('theme', 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};