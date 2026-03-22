# Ocean Breeze Theme System - Integration Guide

## Overview

The Ocean Breeze theme system is now fully integrated into MedSecond. The theme system automatically:

- ✅ Loads theme preferences from localStorage
- ✅ Applies CSS variables to the document root
- ✅ Detects system color scheme preferences
- ✅ Supports light and dark modes
- ✅ Initializes before page render (no theme flashing)

## File Structure

```
src/
├── utils/
│   └── theme/
│       ├── tokens.ts          # Color token definitions (light & dark)
│       └── themeProvider.ts   # Theme application logic
├── hooks/
│   └── useTheme.ts           # React hook for theme management
├── styles/
│   ├── theme.css             # CSS variables and utilities
│   └── globals.css           # Imports theme.css
└── app/
    └── layout.tsx            # Theme initialization script
```

## Using the Theme System

### 1. **In React Components - Using the Hook**

```tsx
'use client';

import { useTheme } from '@/hooks/useTheme';

export function MyComponent() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

### 2. **Using CSS Variables in Styles**

CSS variables are automatically available in any CSS or inline styles:

```tsx
<styled
  style={{
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  }}
/>
```

### 3. **Available CSS Variables**

All theme tokens are automatically applied as CSS variables:

```css
/* Primary Colors */
--color-primary           /* Main brand color */
--color-primary-light     /* Lighter variant */
--color-primary-lighter   /* Lightest variant */

/* Semantic Colors */
--color-success           /* Success/positive */
--color-warning           /* Warnings */
--color-error             /* Errors */
--color-info              /* Information */

/* Backgrounds */
--color-background        /* Main background */
--color-background-secondary
--color-background-tertiary

/* Surfaces */
--color-surface           /* Card/surface color */
--color-surface-hover     /* Hover state */
--color-surface-active    /* Active state */
--color-surface-disabled /* Disabled state */

/* Text */
--color-text-primary      /* Main text */
--color-text-secondary    /* Secondary text */
--color-text-tertiary     /* Tertiary text */
--color-text-inverse      /* Inverse/light text */

/* Borders */
--color-border
--color-border-light
--color-border-dark

/* DNA Visualization */
--color-dna-strand-1      /* Primary strand */
--color-dna-strand-2      /* Secondary strand */
--color-dna-strand-3      /* Tertiary strand */
```

### 4. **Directly Importing Theme Tokens**

For components that need direct access to token objects:

```tsx
import { lightTheme, darkTheme, getTheme } from '@/utils/theme/tokens';

// Get theme by mode
const currentTheme = getTheme('light');

console.log(currentTheme.primary); // '#0A81FF'
```

### 5. **Manual Theme Control**

For advanced use cases:

```tsx
import { 
  setTheme, 
  toggleTheme, 
  getSavedThemeMode,
  initializeTheme 
} from '@/utils/theme/themeProvider';

// Set specific theme
setTheme('dark');

// Toggle between modes
const newMode = toggleTheme('light');

// Get saved preference
const saved = getSavedThemeMode();

// Manual initialization
const mode = initializeTheme();
```

## Key Features

### Auto-Detection of System Preference

The app automatically detects the user's system color scheme preference on first visit:

```typescript
// System prefers dark mode → app starts in dark mode
// System prefers light mode → app starts in light mode
```

### Persistent Storage

Theme selection is saved to localStorage under the key `medsecond-theme-mode`:

```javascript
// Manually check saved theme
const saved = localStorage.getItem('medsecond-theme-mode');
// Returns: 'light' | 'dark' | null
```

### Data Attribute for CSS Selectors (Optional)

The HTML element gets a `data-theme` attribute for optional CSS targeting:

```css
/* Style only in dark mode */
html[data-theme='dark'] .my-element {
  color: #fff;
}

/* Style only in light mode */
html[data-theme='light'] .my-element {
  color: #000;
}
```

## Next Steps: Adding a Theme Toggle

To add a theme toggle button to your app, see the example below:

```tsx
'use client';

import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 rounded-lg bg-surface border border-color-border"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

Add this to either dashboard's header for theme switching capability.

## Customization

To modify theme colors, edit:

1. **Light theme colors** → `/src/utils/theme/tokens.ts` → `lightTheme` object
2. **Dark theme colors** → `/src/utils/theme/tokens.ts` → `darkTheme` object
3. **Default CSS variables** → `/src/styles/theme.css` (fallback values)

Example modification:

```typescript
export const lightTheme: ThemeTokens = {
  primary: '#0A81FF',
  primaryLight: '#59BAEE',
  primaryLighter: '#8DE0F6',
  // ... modify any color here
};
```

## Migration Path

The theme system is now in place but:

- ✅ Your existing hardcoded colors still work
- ✅ No UI redesign needed
- ✅ You can gradually migrate components to use CSS variables
- ✅ Components using `var(--color-primary)` will automatically respect theme changes

To migrate a component:

**Before:**
```tsx
<div style={{ color: '#0A81FF' }}>
```

**After:**
```tsx
<div style={{ color: 'var(--color-primary)' }}>
```

## Technical Details

### Why the Inline Script?

The theme initialization script in `layout.tsx` runs before React hydration to:
1. Prevent theme flashing on page load
2. Respect localStorage preferences immediately
3. Match system color scheme without delay

### CSS Variable Injection

When theme changes, `/src/utils/theme/themeProvider.ts` dynamically updates CSS variables on `document.documentElement`, making changes instant across the entire app.

### localStorage Key

Theme preference is stored as:
```
localStorage.medsecond-theme-mode = 'light' | 'dark'
```

## Troubleshooting

**Theme not persisting?**
- Check browser's localStorage is enabled
- Verify `THEME_STORAGE_KEY = 'medsecond-theme-mode'` matches your setup

**CSS variables not showing?**
- Ensure `@import './theme.css'` is at the top of `globals.css`
- Clear browser cache if needed

**Theme flashing on load?**
- Verify the inline script is in `<head>` tag in `layout.tsx`
- Check localStorage isn't corrupted with invalid values

## Support

The theme system is production-ready and will automatically handle:
- ✅ Theme persistence across sessions
- ✅ Multiple browser tabs/windows
- ✅ System preference detection
- ✅ Smooth transitions between modes
