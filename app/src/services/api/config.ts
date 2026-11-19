import { Platform } from 'react-native';

const envUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').trim();
const envKey = (process.env.EXPO_PUBLIC_API_KEY ?? '').trim();

interface ApiOverrides {
  apiUrl?: string;
  apiKey?: string;
}

let overrides: ApiOverrides = {};

export function setApiOverrides(next: ApiOverrides): void {
  overrides = { ...overrides, ...next };
}

const platformDefault = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export function getApiBaseUrl(): string {
  const raw = (overrides.apiUrl || envUrl || platformDefault).trim();
  return raw.replace(/\/+$/, '');
}

export function getApiKey(): string {
  return (overrides.apiKey || envKey || 'dev-anime1v-key').trim();
}

export function getAnimeApiRoot(): string {
  return `${getApiBaseUrl()}/api/v1/anime`;
}

export function getImageProxyUrl(imageUrl: string): string {
  return `${getAnimeApiRoot()}/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

export function getConfiguredSources(): { apiUrl: string; apiKey: string; fromEnv: boolean } {
  return {
    apiUrl: getApiBaseUrl(),
    apiKey: getApiKey(),
    fromEnv: Boolean(envUrl),
  };
}
