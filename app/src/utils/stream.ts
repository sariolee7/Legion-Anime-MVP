import type { StreamLink } from '@/types/anime';

const INVALID_MEDIA_PATTERN = /\.(css|js|mjs|json|html?|xml|png|jpe?g|gif|webp|svg|ico)(\?|$)/i;
const VALID_MEDIA_PATTERN = /\.(mp4|m3u8|webm|mkv)(\?|$)/i;

const PREFERRED_SERVER_ORDER = [
  'yourupload',
  'pdrain',
  'pixeldrain',
  'hls',
  'zilla',
  'upnshare',
  'vidhide',
  'voe',
  'streamwish',
  'filemoon',
  'streamtape',
];

export function isPlayableMediaUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  if (INVALID_MEDIA_PATTERN.test(url)) {
    return false;
  }
  return VALID_MEDIA_PATTERN.test(url) || url.includes('.m3u8');
}

function serverRank(link: StreamLink): number {
  const haystack = `${link.server} ${link.url}`.toLowerCase();
  const index = PREFERRED_SERVER_ORDER.findIndex((server) => haystack.includes(server));
  return index === -1 ? PREFERRED_SERVER_ORDER.length : index;
}

export function rankStreamLinks(links: StreamLink[]): StreamLink[] {
  const seen = new Set<string>();
  return [...links]
    .filter((link) => {
      if (!link.url || seen.has(link.url)) {
        return false;
      }
      seen.add(link.url);
      const haystack = `${link.server} ${link.url}`.toLowerCase();
      return !haystack.includes('mega');
    })
    .sort((a, b) => serverRank(a) - serverRank(b));
}

export function isHlsUrl(url: string): boolean {
  return url.includes('.m3u8');
}
