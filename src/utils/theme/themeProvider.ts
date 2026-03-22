/**
 * Theme Provider Utilities
 * Handles CSS variable injection and theme application
 */

import { ThemeTokens, ThemeMode, getTheme } from './tokens';

export type { ThemeMode };

const THEME_STORAGE_KEY = 'medsecond-theme-mode';

/**
 * Generate CSS variables object from theme tokens
 */
export function generateCSSVariables(tokens: ThemeTokens): Record<string, string> {
  return {
    '--color-primary': tokens.primary,
    '--color-primary-light': tokens.primaryLight,
    '--color-primary-lighter': tokens.primaryLighter,

    '--color-success': tokens.success,
    '--color-warning': tokens.warning,
    '--color-error': tokens.error,
    '--color-info': tokens.info,

    '--color-background': tokens.background,
    '--color-background-secondary': tokens.backgroundSecondary,
    '--color-background-tertiary': tokens.backgroundTertiary,

    '--color-surface': tokens.surface,
    '--color-surface-hover': tokens.surfaceHover,
    '--color-surface-active': tokens.surfaceActive,
    '--color-surface-disabled': tokens.surfaceDisabled,

    '--color-text-primary': tokens.textPrimary,
    '--color-text-secondary': tokens.textSecondary,
    '--color-text-tertiary': tokens.textTertiary,
    '--color-text-inverse': tokens.textInverse,

    '--color-border': tokens.border,
    '--color-border-light': tokens.borderLight,
    '--color-border-dark': tokens.borderDark,

    '--color-dna-strand-1': tokens.dnaStrand1,
    '--color-dna-strand-2': tokens.dnaStrand2,
    '--color-dna-strand-3': tokens.dnaStrand3,
  };
}

/**
 * Apply theme tokens as CSS variables to document root
 */
export function applyThemeToDOM(mode: ThemeMode): void {
  const theme = getTheme(mode);
  const cssVariables = generateCSSVariables(theme);

  // Apply to document root
  Object.entries(cssVariables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  // Set data attribute for CSS selectors (optional)
  document.documentElement.setAttribute('data-theme', mode);
}

/**
 * Get saved theme mode from localStorage
 */
export function getSavedThemeMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null;

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return null;
}

/**
 * Save theme mode to localStorage
 */
export function saveThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/**
 * Get system preferred color scheme
 */
export function getSystemThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/**
 * Initialize theme - loads from localStorage or system preference
 */
export function initializeTheme(): ThemeMode {
  const savedMode = getSavedThemeMode();

  if (savedMode) {
    applyThemeToDOM(savedMode);
    return savedMode;
  }

  const systemMode = getSystemThemePreference();
  applyThemeToDOM(systemMode);
  return systemMode;
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(currentMode: ThemeMode): ThemeMode {
  const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
  applyThemeToDOM(newMode);
  saveThemeMode(newMode);
  return newMode;
}

/**
 * Set theme explicitly
 */
export function setTheme(mode: ThemeMode): void {
  applyThemeToDOM(mode);
  saveThemeMode(mode);
}
