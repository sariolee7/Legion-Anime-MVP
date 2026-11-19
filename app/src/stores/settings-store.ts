import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEFAULT_PROVIDER } from '@/constants/providers';
import type { AnimeVariant } from '@/types/anime';

interface SettingsState {
  displayName: string;
  provider: string;
  variant: AnimeVariant;
  autoplayNext: boolean;
  apiUrlOverride: string;
  apiKeyOverride: string;
  setDisplayName: (name: string) => void;
  setProvider: (provider: string) => void;
  setVariant: (variant: AnimeVariant) => void;
  setAutoplayNext: (value: boolean) => void;
  setApiOverrides: (apiUrl: string, apiKey: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      displayName: 'Pepito Pérez',
      provider: DEFAULT_PROVIDER,
      variant: 'SUB',
      autoplayNext: true,
      apiUrlOverride: '',
      apiKeyOverride: '',
      setDisplayName: (displayName) => set({ displayName: displayName.trim().slice(0, 40) }),
      setProvider: (provider) => set({ provider }),
      setVariant: (variant) => set({ variant }),
      setAutoplayNext: (autoplayNext) => set({ autoplayNext }),
      setApiOverrides: (apiUrlOverride, apiKeyOverride) =>
        set({
          apiUrlOverride: apiUrlOverride.trim().replace(/\/+$/, ''),
          apiKeyOverride: apiKeyOverride.trim(),
        }),
    }),
    {
      name: 'legion-anime-settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
