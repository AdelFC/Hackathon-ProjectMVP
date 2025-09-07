import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  language: 'fr' | 'en';
  
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (language: 'fr' | 'en') => void;
  toggleLanguage: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,
      language: 'fr',
      
      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode;
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode: newDarkMode };
      }),
      
      setDarkMode: (darkMode) => set(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { darkMode };
      }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'fr' ? 'en' : 'fr' })),
    }),
    {
      name: 'preferences-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode class on hydration
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);