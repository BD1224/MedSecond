'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, toggleTheme as toggleThemeUtil, initializeTheme } from '@/utils/theme/themeProvider';

/**
 * Hook for managing theme state and switching
 * Handles theme persistence and system preference detection
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = initializeTheme();
    setThemeState(initialTheme);
    setIsLoaded(true);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const newTheme = toggleThemeUtil(currentTheme);
      return newTheme;
    });
  }, []);

  return {
    theme,
    isLoaded,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
