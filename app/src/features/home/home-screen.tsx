import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EpisodeRow } from '@/components/anime/episode-row';
import { HeroCarousel } from '@/components/anime/hero-carousel';
import { PosterCard } from '@/components/anime/poster-card';
import { Rail } from '@/components/anime/rail';
import { SectionHeader, SubsectionLabel } from '@/components/anime/section-header';
import { AppHeader } from '@/components/common/app-header';
import { AppImage } from '@/components/common/app-image';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Screen } from '@/components/common/screen';
import { EpisodeRowSkeleton, HeroSkeleton, PosterSkeleton } from '@/components/common/skeleton';
import { flattenCatalog, useCatalog } from '@/hooks/use-catalog';
import { useLatestEpisodes } from '@/hooks/use-latest-episodes';
import { useResponsive } from '@/hooks/use-responsive';
import { useLibraryStore } from '@/stores/library-store';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, layout, typography } from '@/theme';
import type { AnimeListItem, LatestEpisode, WatchProgress } from '@/types/anime';
import {
  groupHistoryByDay,
  groupLatestEpisodesByDay,
  isContinueWatching,
  progressRatio,
} from '@/utils/format';

function SquareCard({ item }: { item: AnimeListItem }) {
  const router = useRouter();
  const width = 170;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/anime',
          params: { url: item.url, title: item.title, image: item.image ?? '' },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`Ver ${item.title}`}
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.85 }]}>
      <AppImage uri={item.image} radius={layout.cardRadius} style={{ width, height: width }} />
      <Text numberOfLines={1} style={styles.squareTitle}>
        {item.title}
      </Text>
    </Pressable>
  );
}

function progressToItem(entry: WatchProgress): AnimeListItem {
  return {
    id: null,
    title: entry.animeTitle,
    slug: null,
    url: entry.animeUrl,
    image: entry.animeImage,
    backdrop: null,
    type: null,
    score: null,
    status: null,
    year: null,
  };
}

export function HomeScreen() {
  const router = useRouter();
  const { width } = useResponsive();
  const provider = useSettingsStore((state) => state.provider);
  const catalog = useCatalog({ provider });
  const latest = useLatestEpisodes(30);
  const history = useLibraryStore((state) => state.history);

  const items = useMemo(() => flattenCatalog(catalog.data), [catalog.data]);
  const heroItems = items.slice(0, 8);
  const recommended = items.slice(8, 28);

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

  const historyGroups = useMemo(() => groupHistoryByDay(history, 9), [history]);

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

  const failed = catalog.isError && items.length === 0;

  const refreshAll = () => {
    void catalog.refetch();
    void latest.refetch();
  };

  return (
    <Screen refreshing={catalog.isRefetching || latest.isRefetching} onRefresh={refreshAll}>
      <AppHeader />

      {catalog.isLoading ? (
        <View>
          <SectionHeader title="Animes del momento" />
          <HeroSkeleton width={Math.min(layout.heroCardWidth, width - 30)} />
          <SectionHeader title="Recomendados" />
          <View style={styles.surfaceBlock}>
            <Rail>
              {[0, 1, 2, 3].map((key) => (
                <PosterSkeleton key={key} width={134} />
              ))}
            </Rail>
          </View>
          <SectionHeader title="Últimos Episodios" />
          <View style={styles.episodeList}>
            <EpisodeRowSkeleton />
            <EpisodeRowSkeleton />
          </View>
        </View>
      ) : failed ? (
        <ErrorState
          title="No se pudo cargar el inicio"
          message={(catalog.error as Error)?.message ?? 'Error inesperado.'}
          onRetry={() => void catalog.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Catálogo vacío"
          description="La API no devolvió resultados en este momento."
          actionLabel="Reintentar"
          onAction={() => void catalog.refetch()}
        />
      ) : (
        <View>
          <SectionHeader title="Animes del momento" />
          <HeroCarousel items={heroItems} />

          {recommended.length > 0 ? (
            <>
              <View style={styles.spacer} />
              <SectionHeader title="Recomendados" />
              <View style={styles.surfaceBlock}>
                <Rail>
                  {recommended.map((item) => (
                    <SquareCard key={item.url} item={item} />
                  ))}
                </Rail>
              </View>
            </>
          ) : null}

          {latestGroups.length > 0 ? (
            <>
              <SectionHeader title="Últimos Episodios" />
              {latestGroups.map((group) => (
                <View key={group.label} style={styles.historyGroup}>
                  <SubsectionLabel title={group.label} />
                  <View style={styles.episodeList}>
                    {group.items.map((episode) => (
                      <EpisodeRow
                        key={episode.url}
                        image={episode.image}
                        title={episode.animeTitle ?? 'Anime'}
                        subtitle={`Episodio ${episode.number ?? '?'}`}
                        onPress={() => openEpisode(episode)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </>
          ) : latest.isLoading ? (
            <>
              <SectionHeader title="Últimos Episodios" />
              <View style={styles.episodeList}>
                <EpisodeRowSkeleton />
                <EpisodeRowSkeleton />
              </View>
            </>
          ) : historyGroups.length > 0 ? (
            <>
              <SectionHeader title="Últimos Episodios" />
              {historyGroups.map((group) => (
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
              ))}
            </>
          ) : null}

          {continueWatching.length > 0 ? (
            <>
              <SectionHeader title="Continuar Viendo" />
              <View style={styles.surfaceBlock}>
                <Rail>
                  {continueWatching.map((entry) => (
                    <PosterCard
                      key={entry.episodeUrl}
                      item={progressToItem(entry)}
                      progress={progressRatio(entry)}
                      onPress={() => openPlayer(entry)}
                    />
                  ))}
                </Rail>
              </View>
            </>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 10,
  },
  surfaceBlock: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
  },
  episodeList: {
    gap: 10,
    paddingHorizontal: layout.screenPadding,
  },
  historyGroup: {
    marginBottom: 12,
  },
  squareTitle: {
    ...typography.cardTitle,
    marginTop: 4,
  },
});
