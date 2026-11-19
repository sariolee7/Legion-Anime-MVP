import { useQuery } from '@tanstack/react-query';

import { resolvePlayableStream } from '@/services/anime/resolve';
import type { StreamLink } from '@/types/anime';

export function useResolvedStream(links: StreamLink[], enabled: boolean) {
  return useQuery({
    queryKey: ['resolved-stream', links.map((link) => link.url).join('|')],
    queryFn: () => resolvePlayableStream(links),
    enabled: enabled && links.length > 0,
    staleTime: 10 * 60_000,
    retry: 1,
    retryDelay: 1500,
  });
}
