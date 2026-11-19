import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { fetchSearch } from '@/services/anime/api';

export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

export function useSearch(query: string, provider: string) {
  const term = query.trim();

  return useQuery({
    queryKey: ['search', provider, term],
    queryFn: () => fetchSearch(term, provider),
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
