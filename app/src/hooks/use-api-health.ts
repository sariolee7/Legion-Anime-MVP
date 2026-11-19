import { useQuery } from '@tanstack/react-query';

import { checkApiHealth } from '@/services/anime/api';

export function useApiHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: checkApiHealth,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 0,
  });
}
