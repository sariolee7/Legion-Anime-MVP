export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  source?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error?: string;
}

export interface AnimeListItem {
  id: number | null;
  title: string;
  slug: string | null;
  url: string;
  image: string | null;
  backdrop: string | null;
  type: string | null;
  score: number | null;
  status: string | null;
  year: string | null;
  provider?: string;
}

export interface SearchData {
  query: string;
  results: AnimeListItem[];
  count: number;
}

export interface CatalogData {
  page: number;
  genre: string | null;
  results: AnimeListItem[];
  count: number;
  hasMore: boolean;
}

export interface Genre {
  id: number | null;
  name: string | null;
  slug: string | null;
  malId: number | null;
}

export interface Episode {
  id: number | null;
  number: number | null;
  title: string;
  url: string;
}

export interface AnimeInfo {
  id: number | null;
  title: string | null;
  titleJapanese: string | null;
  description: string | null;
  image: string | null;
  backdrop: string | null;
  status: string | null;
  type: string | null;
  year: string | null;
  startDate: string | null;
  endDate: string | null;
  score: number | null;
  votes: number | null;
  totalEpisodes: number | null;
  malId: number | null;
  trailer: string | null;
  genres: Genre[];
  episodes: Episode[];
}

export interface StreamLink {
  server: string;
  url: string;
  quality?: string | null;
}

export interface EpisodeLinks {
  id: number | null;
  episode: number | null;
  title: string;
  season: number | null;
  variants: { SUB: number; DUB: number };
  publishedAt: string | null;
  servers: { sub: StreamLink[]; dub: StreamLink[] };
  streamLinks: { SUB: StreamLink[]; DUB: StreamLink[] };
  downloadLinks: { SUB: StreamLink[]; DUB: StreamLink[] };
}

export interface ResolvedStream {
  success: boolean;
  server: string;
  mediaType: 'hls' | 'mp4';
  streamUrl: string;
  resolvedFrom: string;
}

export interface LatestEpisode {
  id: number | null;
  number: number | null;
  title: string;
  publishedAt: string;
  createdAt: string | null;
  commentsCount: number | null;
  animeId: number | null;
  animeTitle: string | null;
  animeSlug: string | null;
  animeUrl: string;
  image: string | null;
  url: string;
}

export interface LatestEpisodesData {
  results: LatestEpisode[];
  count: number;
}

export type AnimeVariant = 'SUB' | 'DUB';

export type LibraryStatus = 'favorite' | 'following' | 'watchLater' | 'completed' | 'discarded';

export interface SavedAnime {
  url: string;
  slug: string | null;
  title: string;
  image: string | null;
  type: string | null;
  score: number | null;
  year: string | null;
  provider: string;
  addedAt: number;
}

export interface WatchProgress {
  animeUrl: string;
  animeTitle: string;
  animeImage: string | null;
  episodeUrl: string;
  episodeNumber: number | null;
  episodeTitle: string;
  positionSec: number;
  durationSec: number;
  updatedAt: number;
}
