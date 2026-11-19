import type { ResolvedStream, StreamLink } from '@/types/anime';
import { isPlayableMediaUrl, rankStreamLinks } from '@/utils/stream';
import { fetchResolvedStream } from './api';

export interface StreamResolution {
  stream: ResolvedStream;
  link: StreamLink;
  attempts: number;
}

const MAX_RESOLVE_ATTEMPTS = 4;

export async function resolvePlayableStream(links: StreamLink[]): Promise<StreamResolution> {
  const candidates = rankStreamLinks(links).slice(0, MAX_RESOLVE_ATTEMPTS);

  if (candidates.length === 0) {
    throw new Error('Este episodio no tiene fuentes de video disponibles.');
  }

  let lastError: unknown = null;
  let attempts = 0;

  for (const link of candidates) {
    attempts += 1;
    try {
      const stream = await fetchResolvedStream(link.url);
      if (isPlayableMediaUrl(stream.streamUrl)) {
        return { stream, link, attempts };
      }
      lastError = new Error(
        `El servidor ${link.server} respondió con un enlace no reproducible. Probando otro servidor...`
      );
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('No se pudo resolver una fuente de video para este episodio.');
}
