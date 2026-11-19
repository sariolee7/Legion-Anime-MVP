import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Bookmark, CircleCheckBig, Heart, Play, type LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EpisodeRow } from '@/components/anime/episode-row';
import { SectionHeader } from '@/components/anime/section-header';
import { AppImage } from '@/components/common/app-image';
import { Chip } from '@/components/common/chip';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/common/skeleton';
import { SubpageHeader } from '@/components/common/subpage-header';
import { useAnimeInfo } from '@/hooks/use-anime-info';
import { useResponsive } from '@/hooks/use-responsive';
import { useIsInList, useLibraryStore } from '@/stores/library-store';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout, typography } from '@/theme';
import type { Episode, SavedAnime } from '@/types/anime';
import { formatAirDate, formatScore, progressRatio } from '@/utils/format';

interface ActionButtonProps {
  label: string;
  Icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}

function ActionButton({ label, Icon, active, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        active && styles.actionButtonActive,
        pressed && { opacity: 0.8 },
      ]}>
      <Icon size={17} color={active ? colors.black : colors.textSecondary} />
      <Text style={[styles.actionLabel, active && styles.actionLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function AnimeDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string; title?: string; image?: string }>();
  const url = Array.isArray(params.url) ? params.url[0] : params.url;
  const snapshotTitle = Array.isArray(params.title) ? params.title[0] : params.title;
  const snapshotImage = Array.isArray(params.image) ? params.image[0] : params.image;
  const info = useAnimeInfo(url);
  const { width } = useResponsive();
  const provider = useSettingsStore((state) => state.provider);
  const progressMap = useLibraryStore((state) => state.progress);
  const toggleInList = useLibraryStore((state) => state.toggleInList);

  const isFavorite = useIsInList('favorite', url ?? '');
  const isFollowing = useIsInList('following', url ?? '');
  const isWatchLater = useIsInList('watchLater', url ?? '');
  const isCompleted = useIsInList('completed', url ?? '');

  const anime = info.data;
  const episodes = useMemo(() => anime?.episodes ?? [], [anime]);

  const savedAnime = useMemo<Omit<SavedAnime, 'addedAt'> | null>(() => {
    if (!url || !anime?.title) {
      return null;
    }
    return {
      url,
      slug: null,
      title: anime.title,
      image: anime.image,
      type: anime.type,
      score: anime.score,
      year: anime.year,
      provider,
    };
  }, [anime, provider, url]);

  const lastProgress = useMemo(() => {
    if (!url) {
      return null;
    }
    return (
      Object.values(progressMap)
        .filter((entry) => entry.animeUrl === url)
        .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null
    );
  }, [progressMap, url]);

  const targetEpisode = useMemo(() => {
    if (episodes.length === 0) {
      return null;
    }
    if (lastProgress) {
      const match =
        episodes.find((episode) => episode.url === lastProgress.episodeUrl) ??
        episodes.find((episode) => episode.number === lastProgress.episodeNumber);
      if (match) {
        return { episode: match, startAt: lastProgress.positionSec };
      }
    }
    return { episode: episodes[0], startAt: 0 };
  }, [episodes, lastProgress]);

  const playEpisode = (episode: Episode, startAt = 0) => {
    if (!url || !anime?.title) {
      return;
    }
    router.push({
      pathname: '/player',
      params: {
        episodeUrl: episode.url,
        animeUrl: url,
        animeTitle: anime.title,
        animeImage: anime.image ?? '',
        episode: episode.number !== null ? String(episode.number) : '',
        episodeTitle: episode.title,
        startAt: String(Math.floor(startAt)),
      },
    });
  };

  const handleToggle = (status: 'favorite' | 'following' | 'watchLater' | 'completed') => {
    if (savedAnime) {
      toggleInList(status, { ...savedAnime, addedAt: Date.now() });
    }
  };

  const japaneseTitle =
    anime?.titleJapanese && !/^\?+$/.test(anime.titleJapanese) ? anime.titleJapanese : null;

  const meta: string[] = [];
  const score = formatScore(anime?.score);
  if (score) {
    meta.push(`★ ${score}`);
  }
  if (anime?.year) {
    meta.push(anime.year);
  }
  if (anime?.type) {
    meta.push(anime.type);
  }
  if (episodes.length > 0) {
    meta.push(`${episodes.length} episodios`);
  }
  if (anime?.status) {
    meta.push(anime.status);
  }
  const airDate = formatAirDate(anime?.startDate);
  if (airDate) {
    meta.push(airDate);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {info.isLoading ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.hero, { height: Math.min(320, Math.max(230, width * 0.52)) }]}>
            <AppImage uri={snapshotImage || null} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['transparent', 'rgba(19,19,19,0.55)', colors.background]}
              style={styles.heroGradient}
            />
            <View style={styles.backFloating}>
              <SubpageHeader title="" />
            </View>
          </View>
          <View style={styles.content}>
            {snapshotTitle ? (
              <Text style={styles.title}>{snapshotTitle}</Text>
            ) : (
              <Skeleton style={{ height: 22, width: '70%' }} />
            )}
            <Skeleton style={{ height: 12, width: '45%' }} />
            <Skeleton style={{ height: 14, width: '80%' }} />
            <Skeleton style={{ height: 90, width: '100%' }} />
            <Skeleton style={{ height: 44, width: '100%' }} />
          </View>
        </ScrollView>
      ) : info.isError || !anime ? (
        <View style={{ flex: 1 }}>
          <SubpageHeader title={snapshotTitle ?? 'Detalle'} subtitle="Error al cargar" />
          <ErrorState
            title="No se pudo cargar el anime"
            message={(info.error as Error)?.message ?? 'Error inesperado.'}
            onRetry={() => void info.refetch()}
          />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.hero, { height: Math.min(320, Math.max(230, width * 0.52)) }]}>
            <AppImage uri={anime.backdrop ?? anime.image} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['transparent', 'rgba(19,19,19,0.55)', colors.background]}
              style={styles.heroGradient}
            />
            <View style={styles.backFloating}>
              <SubpageHeader title="" />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{anime.title}</Text>
            {japaneseTitle ? <Text style={styles.japanese}>{japaneseTitle}</Text> : null}

            <View style={styles.metaRow}>
              {meta.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </View>

            {anime.genres.length > 0 ? (
              <View style={styles.metaRow}>
                {anime.genres.map((genre, index) => (
                  <Chip
                    key={`${genre.slug ?? genre.name ?? index}`}
                    label={genre.name ?? 'Género'}
                    onPress={
                      genre.slug
                        ? () =>
                            router.push({
                              pathname: '/grid',
                              params: { title: genre.name ?? 'Género', genre: genre.slug as string },
                            })
                        : undefined
                    }
                  />
                ))}
              </View>
            ) : null}

            {anime.description ? <Text style={styles.description}>{anime.description}</Text> : null}

            <View style={styles.actionsRow}>
              <ActionButton
                label="Favorito"
                Icon={Heart}
                active={isFavorite}
                onPress={() => handleToggle('favorite')}
              />
              <ActionButton
                label="Siguiendo"
                Icon={Bell}
                active={isFollowing}
                onPress={() => handleToggle('following')}
              />
              <ActionButton
                label="Ver luego"
                Icon={Bookmark}
                active={isWatchLater}
                onPress={() => handleToggle('watchLater')}
              />
              <ActionButton
                label="Terminado"
                Icon={CircleCheckBig}
                active={isCompleted}
                onPress={() => handleToggle('completed')}
              />
            </View>

            {targetEpisode ? (
              <Pressable
                onPress={() => playEpisode(targetEpisode.episode, targetEpisode.startAt)}
                style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.85 }]}>
                <Play size={16} color={colors.black} fill={colors.black} />
                <Text style={styles.playButtonText}>
                  {targetEpisode.startAt > 30
                    ? `Continuar episodio ${targetEpisode.episode.number ?? ''}`
                    : 'Ver ahora'}
                </Text>
              </Pressable>
            ) : (
              <EmptyState
                title="Sin episodios"
                description="La API no devolvió episodios para este anime en este momento."
              />
            )}
          </View>

          {episodes.length > 0 ? (
            <View>
              <SectionHeader title={`Episodios (${episodes.length})`} />
              <View style={styles.episodeList}>
                {episodes.map((episode) => {
                  const progress = progressMap[episode.url];
                  return (
                    <EpisodeRow
                      key={episode.url}
                      image={anime.image}
                      title={`Episodio ${episode.number ?? '?'}`}
                      subtitle={
                        episode.title && !/^Episodio\s/i.test(episode.title)
                          ? episode.title
                          : (anime.title ?? '')
                      }
                      progress={progress ? progressRatio(progress) : undefined}
                      onPress={() => {
                        const startAt =
                          progress &&
                          progress.durationSec > 0 &&
                          progressRatio(progress) < 0.95
                            ? progress.positionSec
                            : 0;
                        playEpisode(episode, startAt);
                      }}
                      isFavorite={isFavorite}
                      onToggleFavorite={() => handleToggle('favorite')}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingBottom: 48,
  },
  hero: {
    width: '100%',
    backgroundColor: colors.placeholder,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  backFloating: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: 12,
    marginTop: -10,
  },
  title: typography.sectionTitle,
  japanese: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  description: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    paddingHorizontal: 12,
    height: 38,
  },
  actionButtonActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  actionLabel: {
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  actionLabelActive: {
    color: colors.black,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    height: 44,
    marginTop: 4,
  },
  playButtonText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: colors.black,
  },
  episodeList: {
    gap: 10,
    paddingHorizontal: layout.screenPadding,
  },
  paddedBlock: {
    paddingHorizontal: layout.screenPadding,
  },
  loadingBlock: {
    flex: 1,
  },
});
