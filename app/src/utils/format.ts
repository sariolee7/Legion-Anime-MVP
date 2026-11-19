import type { LatestEpisode, WatchProgress } from '@/types/anime';

export function formatScore(score: number | null | undefined): string | null {
  if (typeof score !== 'number' || Number.isNaN(score) || score <= 0) {
    return null;
  }
  return score.toFixed(2);
}

export function formatEpisodeNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '?';
  }
  return String(value);
}

export function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function progressRatio(entry: WatchProgress): number {
  if (!entry.durationSec || entry.durationSec <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, entry.positionSec / entry.durationSec));
}

export function isContinueWatching(entry: WatchProgress): boolean {
  return entry.positionSec > 30 && progressRatio(entry) < 0.95;
}

function startOfDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function historyDayLabel(timestamp: number, now = new Date()): string {
  const dayDiff = Math.round((startOfDay(now) - startOfDay(new Date(timestamp))) / 86400000);
  if (dayDiff <= 0) {
    return 'Hoy';
  }
  if (dayDiff === 1) {
    return 'Ayer';
  }
  return new Date(timestamp).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
}

export interface HistoryGroup {
  label: string;
  items: WatchProgress[];
}

export function groupHistoryByDay(history: WatchProgress[], limit = 12): HistoryGroup[] {
  const sorted = [...history].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  const groups: HistoryGroup[] = [];

  for (const entry of sorted) {
    const label = historyDayLabel(entry.updatedAt);
    const group = groups.find((candidate) => candidate.label === label);
    if (group) {
      group.items.push(entry);
    } else {
      groups.push({ label, items: [entry] });
    }
  }

  return groups;
}

export function parsePublishedAt(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  let candidate = value.trim().replace(' ', 'T');
  if (/T\d{2}:\d{2}/.test(candidate)) {
    candidate = candidate.replace(/([+-]\d{2})$/, '$1:00');
    if (!/(Z|[+-]\d{2}:\d{2})$/.test(candidate)) {
      candidate += 'Z';
    }
  }

  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface LatestEpisodeGroup {
  label: string;
  items: LatestEpisode[];
}

export function groupLatestEpisodesByDay(episodes: LatestEpisode[]): LatestEpisodeGroup[] {
  const groups: LatestEpisodeGroup[] = [];

  for (const episode of episodes) {
    const parsed = parsePublishedAt(episode.publishedAt);
    const label = parsed ? historyDayLabel(parsed.getTime()) : 'Recientes';
    const existing = groups.find((group) => group.label === label);
    if (existing) {
      existing.items.push(episode);
    } else {
      groups.push({ label, items: [episode] });
    }
  }

  return groups;
}

export function formatAirDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function sanitizeSearchTerm(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trimStart().slice(0, 80);
}
