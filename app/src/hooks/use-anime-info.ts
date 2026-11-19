import { useQuery } from '@tanstack/react-query';

import { fetchAnimeInfo } from '@/services/anime/api';

export function useAnimeInfo(url: string | undefined) {
  return useQuery({
    queryKey: ['anime-info', url],
    queryFn: () => fetchAnimeInfo(url as string),
    enabled: Boolean(url),
    staleTime: 24 * 60 * 60_000,
    retry: 1,
  });
}
