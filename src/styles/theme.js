// Central design tokens for Midnight Munch — Warm Botanical / Harvest palette.
// All components should consume these via CSS variables (injected below),
// never hardcoded hex values.

export const palette = {
  olive: '#606C38', // primary: nav, headers, primary buttons
  forest: '#283618', // dark mode background base
  cream: '#FEFAE0', // light mode background base
  tan: '#DDA15E', // accents, cards, secondary highlights
  rust: '#BC6C25', // CTAs, "low nutrition" flags, "over budget" warnings
};

// Tan is deliberately used sparingly (accents/highlights only) — as a
// dominant color it fights the greens, especially in dark mode.
export const themes = {
  light: {
    '--color-bg': palette.cream,
    '--color-surface': '#FFFFFF',
    '--color-surface-alt': '#F6EFCF',
    '--color-text': palette.forest,
    '--color-text-muted': '#6B7052',
    '--color-primary': palette.olive,
    '--color-primary-contrast': palette.cream,
    '--color-accent': palette.tan,
    '--color-warn': palette.rust,
    '--color-progress': palette.olive,
    '--color-border': '#E4DCB8',
    '--color-topbar': palette.olive,
    '--color-topbar-text': palette.cream,
    '--color-tabbar': '#FFFFFF',
    '--shadow-card': '0 2px 8px rgba(40, 54, 24, 0.10)',
  },
  dark: {
    '--color-bg': palette.forest,
    '--color-surface': '#31401D',
    '--color-surface-alt': '#3A4B23',
    '--color-text': palette.cream,
    '--color-text-muted': '#BBC09B',
    '--color-primary': palette.olive,
    '--color-primary-contrast': palette.cream,
    '--color-accent': palette.tan,
    '--color-warn': palette.rust,
    '--color-progress': '#8C9C55', // lightened olive so bars read on dark surfaces
    '--color-border': '#44552A',
    '--color-topbar': '#223013',
    '--color-topbar-text': palette.cream,
    '--color-tabbar': '#223013',
    '--shadow-card': '0 2px 10px rgba(0, 0, 0, 0.35)',
  },
};

const THEME_KEY = 'mm-theme';

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(name) {
  const vars = themes[name] || themes.light;
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
  document.documentElement.dataset.theme = name;
  localStorage.setItem(THEME_KEY, name);
}
