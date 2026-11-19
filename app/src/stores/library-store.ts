import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LibraryStatus, SavedAnime, WatchProgress } from '@/types/anime';

const EMPTY_LISTS: Record<LibraryStatus, SavedAnime[]> = {
  favorite: [],
  following: [],
  watchLater: [],
  completed: [],
  discarded: [],
};

interface LibraryState {
  lists: Record<LibraryStatus, SavedAnime[]>;
  history: WatchProgress[];
  progress: Record<string, WatchProgress>;
  addToList: (status: LibraryStatus, anime: SavedAnime) => void;
  removeFromList: (status: LibraryStatus, url: string) => void;
  toggleInList: (status: LibraryStatus, anime: SavedAnime) => void;
  saveProgress: (entry: WatchProgress) => void;
  clearHistory: () => void;
  resetLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      lists: { ...EMPTY_LISTS },
      history: [],
      progress: {},

      addToList: (status, anime) =>
        set((state) => {
          const current = state.lists[status];
          if (current.some((item) => item.url === anime.url)) {
            return state;
          }
          return {
            lists: {
              ...state.lists,
              [status]: [{ ...anime, addedAt: Date.now() }, ...current],
            },
          };
        }),

      removeFromList: (status, url) =>
        set((state) => ({
          lists: {
            ...state.lists,
            [status]: state.lists[status].filter((item) => item.url !== url),
          },
        })),

      toggleInList: (status, anime) => {
        const exists = get().lists[status].some((item) => item.url === anime.url);
        if (exists) {
          get().removeFromList(status, anime.url);
        } else {
          get().addToList(status, anime);
        }
      },

      saveProgress: (entry) =>
        set((state) => ({
          progress: { ...state.progress, [entry.episodeUrl]: entry },
          history: [
            entry,
            ...state.history.filter((item) => item.episodeUrl !== entry.episodeUrl),
          ].slice(0, 30),
        })),

      clearHistory: () => set({ history: [] }),

      resetLibrary: () =>
        set({
          lists: { ...EMPTY_LISTS },
          history: [],
          progress: {},
        }),
    }),
    {
      name: 'legion-anime-library',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useIsInList(status: LibraryStatus, url: string): boolean {
  return useLibraryStore((state) => state.lists[status].some((item) => item.url === url));
}

export function useListCount(status: LibraryStatus): number {
  return useLibraryStore((state) => state.lists[status].length);
}
