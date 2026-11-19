import { useQuery } from '@tanstack/react-query';

import { fetchEpisodeLinks } from '@/services/anime/api';

export function useEpisodeLinks(episodeUrl: string | undefined) {
  return useQuery({
    queryKey: ['episode-links', episodeUrl],
    queryFn: () => fetchEpisodeLinks(episodeUrl as string),
    enabled: Boolean(episodeUrl),
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
