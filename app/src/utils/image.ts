import { getImageProxyUrl } from '@/services/api/config';

export function resolveImageSource(image: string | null | undefined): string | null {
  if (!image) {
    return null;
  }
  return getImageProxyUrl(image);
}
