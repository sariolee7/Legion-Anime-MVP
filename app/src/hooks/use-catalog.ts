import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchCatalog } from '@/services/anime/api';
import type { AnimeListItem, CatalogData } from '@/types/anime';

interface UseCatalogParams {
  provider: string;
  genre?: string;
}

export function useCatalog({ provider, genre }: UseCatalogParams) {
  return useInfiniteQuery({
    queryKey: ['catalog', provider, genre ?? null],
    queryFn: ({ pageParam }) => fetchCatalog({ page: pageParam, provider, genre }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

export function flattenCatalog(data: { pages: CatalogData[] } | undefined): AnimeListItem[] {
  if (!data) {
    return [];
  }
  const seen = new Set<string>();
  const items: AnimeListItem[] = [];

  for (const page of data.pages) {
    for (const item of page.results) {
      if (item.url && !seen.has(item.url)) {
        seen.add(item.url);
        items.push(item);
      }
    }
  }

  return items;
}
