import { create } from 'zustand';

const THEME_STORAGE_KEY = 'friendly_canvas_theme';

export const useThemeStore = create((set, get) => ({
  theme: 'dark', // Default dark theme as requested

  initializeTheme: () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    set({ theme: savedTheme });
    applyThemeToDOM(savedTheme);
  },

  setTheme: (newTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    set({ theme: newTheme });
    applyThemeToDOM(newTheme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    set({ theme: nextTheme });
    applyThemeToDOM(nextTheme);
  },
}));

function applyThemeToDOM(theme) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }
}
