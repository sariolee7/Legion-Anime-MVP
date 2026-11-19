import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Carousel, type CarouselItem } from '@/components/anime/carousel';
import { EpisodeRow } from '@/components/anime/episode-row';
import { SectionHeader, SubsectionLabel } from '@/components/anime/section-header';
import { ApiErrorBanner } from '@/components/common/api-error-banner';
import { AppHeader } from '@/components/common/app-header';
import { EmptyState } from '@/components/common/empty-state';
import { Screen } from '@/components/common/screen';
import { EpisodeRowSkeleton } from '@/components/common/skeleton';
import { flattenCatalog, useCatalog } from '@/hooks/use-catalog';
import { useLatestEpisodes } from '@/hooks/use-latest-episodes';
import { useLibraryStore } from '@/stores/library-store';
import { useSettingsStore } from '@/stores/settings-store';
import { layout } from '@/theme';
import type { LatestEpisode, SavedAnime, WatchProgress } from '@/types/anime';
import {
  groupHistoryByDay,
  groupLatestEpisodesByDay,
  isContinueWatching,
  progressRatio,
} from '@/utils/format';

function latestToSaved(episode: LatestEpisode, provider: string): SavedAnime {
  return {
    url: episode.animeUrl,
    slug: episode.animeSlug,
    title: episode.animeTitle ?? 'Anime',
    image: episode.image,
    type: null,
    score: null,
    year: null,
    provider,
    addedAt: Date.now(),
  };
}

export function HomeScreen() {
  const router = useRouter();
  const provider = useSettingsStore((state) => state.provider);
  const catalog = useCatalog({ provider });
  const latest = useLatestEpisodes(30);
  const history = useLibraryStore((state) => state.history);
  const lists = useLibraryStore((state) => state.lists);
  const toggleInList = useLibraryStore((state) => state.toggleInList);

  const items = useMemo(() => flattenCatalog(catalog.data), [catalog.data]);

  const heroItems = useMemo(
    () =>
      items.slice(0, 8).map((item) => ({
        key: item.url,
        title: item.title,
        image: item.image,
      })),
    [items]
  );

  const recommendedItems = useMemo(
    () =>
      items.slice(8, 28).map((item) => ({
        key: item.url,
        title: item.title,
        image: item.image,
      })),
    [items]
  );

  const favoriteUrls = useMemo(() => new Set(lists.favorite.map((item) => item.url)), [lists.favorite]);
  const watchLaterUrls = useMemo(() => new Set(lists.watchLater.map((item) => item.url)), [lists.watchLater]);
  const discardedUrls = useMemo(() => new Set(lists.discarded.map((item) => item.url)), [lists.discarded]);

  const latestGroups = useMemo(
    () => groupLatestEpisodesByDay(latest.data?.results ?? []),
    [latest.data]
  );

  const continueWatching = useMemo(() => {
    const seen = new Set<string>();
    const result: WatchProgress[] = [];
    for (const entry of [...history].sort((a, b) => b.updatedAt - a.updatedAt)) {
      if (isContinueWatching(entry) && !seen.has(entry.animeUrl)) {
        seen.add(entry.animeUrl);
        result.push(entry);
      }
      if (result.length >= 10) {
        break;
      }
    }
    return result;
  }, [history]);

  const continueItems = useMemo(
    () =>
      continueWatching.map((entry) => ({
        key: entry.episodeUrl,
        title: entry.animeTitle,
        image: entry.animeImage,
        progress: progressRatio(entry),
      })),
    [continueWatching]
  );

  const historyGroups = useMemo(() => groupHistoryByDay(history, 9), [history]);

  const openAnime = (item: CarouselItem) => {
    router.push({
      pathname: '/anime',
      params: { url: item.key, title: item.title, image: item.image ?? '' },
    });
  };

  const openContinue = (item: CarouselItem) => {
    const entry = continueWatching.find((candidate) => candidate.episodeUrl === item.key);
    if (entry) {
      openPlayer(entry);
    }
  };

  const openPlayer = (entry: WatchProgress) => {
    router.push({
      pathname: '/player',
      params: {
        episodeUrl: entry.episodeUrl,
        animeUrl: entry.animeUrl,
        animeTitle: entry.animeTitle,
        animeImage: entry.animeImage ?? '',
        episode: entry.episodeNumber !== null ? String(entry.episodeNumber) : '',
        episodeTitle: entry.episodeTitle,
        startAt: String(Math.floor(entry.positionSec)),
      },
    });
  };

  const openEpisode = (episode: LatestEpisode) => {
    if (!episode.animeUrl) {
      return;
    }
    router.push({
      pathname: '/player',
      params: {
        episodeUrl: episode.url,
        animeUrl: episode.animeUrl,
        animeTitle: episode.animeTitle ?? 'Anime',
        animeImage: episode.image ?? '',
        episode: episode.number !== null ? String(episode.number) : '',
        episodeTitle: episode.title,
      },
    });
  };

  const catalogError = catalog.isError
    ? (catalog.error as Error)?.message ?? 'No se pudo cargar el inicio.'
    : undefined;

  const refreshAll = () => {
    void catalog.refetch();
    void latest.refetch();
  };

  const hasLatest = latestGroups.length > 0;

  return (
    <Screen refreshing={catalog.isRefetching || latest.isRefetching} onRefresh={refreshAll}>
      <AppHeader />

      <Carousel
        title="Animes del momento"
        items={heroItems}
        cardType="hero"
        loading={catalog.isLoading}
        loadingCount={1}
        errorMessage={catalogError}
        onRetry={() => void catalog.refetch()}
        onItemPress={openAnime}
      />

      <Carousel
        title="Recomendados"
        items={recommendedItems}
        cardType="portada"
        loading={catalog.isLoading}
        onItemPress={openAnime}
      />

      <Carousel
        title="Continuar Viendo"
        items={continueItems}
        cardType="portada"
        onItemPress={openContinue}
      />

      {!catalog.isLoading && !catalog.isError && items.length === 0 ? (
        <EmptyState
          title="Catálogo vacío"
          description="La API no devolvió resultados en este momento."
          actionLabel="Reintentar"
          onAction={() => void catalog.refetch()}
        />
      ) : null}

      <SectionHeader title="Últimos Episodios" />
      {latest.isError && !hasLatest ? (
        <ApiErrorBanner
          message="No se pudieron cargar los estrenos. Desliza para reintentar."
          onRetry={() => void latest.refetch()}
        />
      ) : null}

      {hasLatest ? (
        latestGroups.map((group) => (
          <View key={group.label} style={styles.historyGroup}>
            <SubsectionLabel title={group.label} />
            <View style={styles.episodeList}>
              {group.items.map((episode) => {
                const saved = latestToSaved(episode, provider);
                return (
                  <EpisodeRow
                    key={episode.url}
                    image={episode.image}
                    title={episode.animeTitle ?? 'Anime'}
                    subtitle={`Episodio ${episode.number ?? '?'}`}
                    onPress={() => openEpisode(episode)}
                    isFavorite={favoriteUrls.has(episode.animeUrl)}
                    onToggleFavorite={() => toggleInList('favorite', saved)}
                    isInList={watchLaterUrls.has(episode.animeUrl)}
                    onAddToList={() => toggleInList('watchLater', saved)}
                    isDiscarded={discardedUrls.has(episode.animeUrl)}
                    onToggleDiscarded={() => toggleInList('discarded', saved)}
                  />
                );
              })}
            </View>
          </View>
        ))
      ) : latest.isLoading ? (
        <View style={styles.episodeList}>
          <EpisodeRowSkeleton />
          <EpisodeRowSkeleton />
        </View>
      ) : latest.isError && historyGroups.length === 0 ? null : historyGroups.length > 0 ? (
        historyGroups.map((group) => (
          <View key={group.label} style={styles.historyGroup}>
            <SubsectionLabel title={group.label} />
            <View style={styles.episodeList}>
              {group.items.map((entry) => (
                <EpisodeRow
                  key={entry.episodeUrl}
                  image={entry.animeImage}
                  title={entry.animeTitle}
                  subtitle={`Episodio ${entry.episodeNumber ?? '?'}`}
                  progress={progressRatio(entry)}
                  onPress={() => openPlayer(entry)}
                />
              ))}
            </View>
          </View>
        ))
      ) : (
        <EmptyState
          title="Aún no hay estrenos"
          description="Cuando la API publique nuevos episodios aparecerán aquí."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  episodeList: {
    gap: 10,
    paddingHorizontal: layout.screenPadding,
  },
  historyGroup: {
    marginBottom: 12,
  },
});
