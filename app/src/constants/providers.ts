export interface AnimeProvider {
  id: string;
  label: string;
}

export const PROVIDERS: AnimeProvider[] = [
  { id: 'animeav1', label: 'AnimeAV1' },
  { id: 'animeflv', label: 'AnimeFLV' },
  { id: 'tioanime', label: 'TioAnime' },
  { id: 'monoschinos', label: 'MonosChinos' },
  { id: 'jkanime', label: 'JKAnime' },
];

export const DEFAULT_PROVIDER = 'animeav1';

export const PROVIDER_LABELS: Record<string, string> = Object.fromEntries(
  PROVIDERS.map((provider) => [provider.id, provider.label])
);
