import { useQuery } from '@tanstack/react-query';

import { fetchLatestEpisodes } from '@/services/anime/api';

export function useLatestEpisodes(limit = 30) {
  return useQuery({
    queryKey: ['latest-episodes', limit],
    queryFn: () => fetchLatestEpisodes(limit),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
