import type {
  AnimeInfo,
  ApiEnvelope,
  CatalogData,
  EpisodeLinks,
  LatestEpisodesData,
  ResolvedStream,
  SearchData,
} from '@/types/anime';
import { client } from '../api/client';
import { getApiBaseUrl } from '../api/config';

export interface CatalogParams {
  page?: number;
  provider?: string;
  genre?: string;
}

export async function fetchCatalog(params: CatalogParams = {}): Promise<CatalogData> {
  const response = await client.get<ApiEnvelope<CatalogData>>('/api/v1/anime/catalog', {
    params: {
      page: params.page ?? 1,
      provider: params.provider,
      genre: params.genre,
    },
  });
  return response.data.data;
}

export async function fetchSearch(query: string, provider = 'animeav1'): Promise<SearchData> {
  const response = await client.get<ApiEnvelope<SearchData>>('/api/v1/anime/search', {
    params: { q: query, domain: provider },
  });
  return response.data.data;
}

export async function fetchAnimeInfo(url: string): Promise<AnimeInfo> {
  const response = await client.get<ApiEnvelope<AnimeInfo>>('/api/v1/anime/info', {
    params: { url },
    timeout: 60000,
  });
  return response.data.data;
}

export async function fetchEpisodeLinks(episodeUrl: string, includeMega = false): Promise<EpisodeLinks> {
  const response = await client.get<ApiEnvelope<EpisodeLinks>>('/api/v1/anime/episode', {
    params: { url: episodeUrl, includeMega },
    timeout: 60000,
  });
  return response.data.data;
}

export async function fetchLatestEpisodes(limit = 30): Promise<LatestEpisodesData> {
  const response = await client.get<ApiEnvelope<LatestEpisodesData>>('/api/v1/anime/latest-episodes', {
    params: { limit },
    timeout: 60000,
  });
  return response.data.data;
}

export async function fetchResolvedStream(url: string): Promise<ResolvedStream> {
  const response = await client.get<ResolvedStream>('/api/v1/anime/resolve', {
    params: { url },
    timeout: 90000,
  });
  return response.data;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await client.get<{ success?: boolean; status?: string }>('/health', {
      timeout: 8000,
      baseURL: undefined,
    });
    return response.data?.status === 'ok' || response.data?.success === true;
  } catch {
    return false;
  }
}

export function describeApiTarget(): string {
  return getApiBaseUrl();
}
