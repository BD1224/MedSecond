'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('medsecond-theme-mode') as Theme | null;
    const mode = (saved === 'light' || saved === 'dark')
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    setTheme(mode);
    setMounted(true);
  }, []);

  const toggleTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('medsecond-theme-mode', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      setTheme(newTheme);
      
      // Dispatch custom event to notify DNA Background about theme change
      window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
    } catch (e) {
      console.error('Failed to set theme:', e);
    }
  };

  return {
    theme,
    toggleTheme,
    mounted,
  };
}
