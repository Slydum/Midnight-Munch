// Midnight Munch — warm modern kitchen palette.
export const palette = {
  oat: '#F5F1E8',
  paper: '#FFFDFA',
  ink: '#34352F',
  muted: '#77786D',
  sage: '#788A72',
  sageDeep: '#5F735C',
  terracotta: '#C88772',
  rose: '#D9AAA0',
  line: '#E7E0D5',
};

export const themes = {
  light: {
    '--color-bg': palette.oat,
    '--color-surface': palette.paper,
    '--color-surface-alt': '#EEEAE0',
    '--color-text': palette.ink,
    '--color-text-muted': palette.muted,
    '--color-primary': palette.sage,
    '--color-primary-contrast': '#FFFFFF',
    '--color-accent': palette.terracotta,
    '--color-warn': '#B96F5D',
    '--color-progress': palette.sage,
    '--color-border': palette.line,
    '--color-topbar': '#F8F5EE',
    '--color-topbar-text': palette.ink,
    '--color-tabbar': '#FFFDFA',
    '--shadow-card': '0 5px 18px rgba(55, 49, 39, 0.055)',
  },
  dark: {
    '--color-bg': '#252722',
    '--color-surface': '#30332D',
    '--color-surface-alt': '#393D35',
    '--color-text': '#F4F0E7',
    '--color-text-muted': '#B8B9AC',
    '--color-primary': '#91A38A',
    '--color-primary-contrast': '#20251F',
    '--color-accent': '#D6A091',
    '--color-warn': '#D18B78',
    '--color-progress': '#A3B69B',
    '--color-border': '#484C43',
    '--color-topbar': '#292C26',
    '--color-topbar-text': '#F4F0E7',
    '--color-tabbar': '#292C26',
    '--shadow-card': '0 6px 20px rgba(0, 0, 0, 0.16)',
  },
};

// Versioned key resets the old olive theme preference and starts in light mode.
const THEME_KEY = 'mm-theme-v2';

export function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'dark' || saved === 'light' ? saved : 'light';
}

export function applyTheme(name) {
  const selected = name === 'dark' ? 'dark' : 'light';
  const vars = themes[selected];
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
  document.documentElement.dataset.theme = selected;
  localStorage.setItem(THEME_KEY, selected);
}
