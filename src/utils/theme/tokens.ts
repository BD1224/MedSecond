/**
 * Ocean Breeze Theme Tokens
 * Comprehensive color system for light and dark modes
 */

export interface ThemeTokens {
  // Primary Colors
  primary: string;
  primaryLight: string;
  primaryLighter: string;

  // Semantic Colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surfaces
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceDisabled: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Borders
  border: string;
  borderLight: string;
  borderDark: string;

  // Special
  dnaStrand1: string;
  dnaStrand2: string;
  dnaStrand3: string;
}

/**
 * Light Theme - Ocean Breeze
 * Clean, bright, professional medical app aesthetic
 */
export const lightTheme: ThemeTokens = {
  // Primary - Ocean Blue (Medical/Scientific)
  primary: '#0A81FF',
  primaryLight: '#59BAEE',
  primaryLighter: '#8DE0F6',

  // Semantic Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  // Surfaces
  surface: '#FFFFFF',
  surfaceHover: '#F9FAFB',
  surfaceActive: '#EFF6FF',
  surfaceDisabled: '#F3F4F6',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // DNA Visualization
  dnaStrand1: '#0A81FF',
  dnaStrand2: '#59BAEE',
  dnaStrand3: '#8DE0F6',
};

/**
 * Dark Theme - Ocean Breeze (Dark Mode)
 * Deep, professional dark mode for reduced eye strain
 */
export const darkTheme: ThemeTokens = {
  // Primary - Ocean Blue (maintains brand consistency)
  primary: '#3A9BFF',
  primaryLight: '#60C5FF',
  primaryLighter: '#A0DBFF',

  // Semantic Colors
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#22D3EE',

  // Backgrounds
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',

  // Surfaces
  surface: '#1E293B',
  surfaceHover: '#334155',
  surfaceActive: '#1E3A8A',
  surfaceDisabled: '#475569',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',

  // Borders
  border: '#334155',
  borderLight: '#1E293B',
  borderDark: '#475569',

  // DNA Visualization (brightened for dark mode)
  dnaStrand1: '#3A9BFF',
  dnaStrand2: '#60C5FF',
  dnaStrand3: '#A0DBFF',
};

export type ThemeMode = 'light' | 'dark';

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode): ThemeTokens {
  return mode === 'light' ? lightTheme : darkTheme;
}
