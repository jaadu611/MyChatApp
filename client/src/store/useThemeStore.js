import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "bumblebee",
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: "theme-storage",
    }
  )
);
