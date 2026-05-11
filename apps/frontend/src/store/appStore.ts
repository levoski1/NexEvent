import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  adminKey: string;
  setAdminKey: (key: string) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      adminKey: '',
      setAdminKey: (key) => {
        localStorage.setItem('admin_key', key);
        set({ adminKey: key });
      },
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'nexevent-app' },
  ),
);
