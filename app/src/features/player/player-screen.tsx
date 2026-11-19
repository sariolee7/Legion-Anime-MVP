import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Server } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/common/chip';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { StreamingVideo } from '@/components/common/streaming-video';
import { SubpageHeader } from '@/components/common/subpage-header';
import { useAnimeInfo } from '@/hooks/use-anime-info';
import { useEpisodeLinks } from '@/hooks/use-episode-links';
import { useResolvedStream } from '@/hooks/use-resolved-stream';
import { useLibraryStore } from '@/stores/library-store';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout, typography } from '@/theme';
import type { AnimeVariant, Episode, WatchProgress } from '@/types/anime';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    episodeUrl?: string;
    animeUrl?: string;
    animeTitle?: string;
    animeImage?: string;
    episode?: string;
    episodeTitle?: string;
    startAt?: string;
    variant?: string;
  }>();

  const episodeUrl = first(params.episodeUrl);
  const animeUrl = first(params.animeUrl);
  const animeTitle = first(params.animeTitle) ?? 'Anime';
  const animeImage = first(params.animeImage) || null;
  const episodeNumber = toNumber(first(params.episode));
  const episodeTitle = first(params.episodeTitle) ?? `Episodio ${episodeNumber ?? '?'}`;
  const startAtParam = toNumber(first(params.startAt)) ?? 0;
  const initialVariant = first(params.variant) === 'DUB' ? 'DUB' : first(params.variant) === 'SUB' ? 'SUB' : null;

  const settingsVariant = useSettingsStore((state) => state.variant);
  const autoplayNext = useSettingsStore((state) => state.autoplayNext);
  const saveProgress = useLibraryStore((state) => state.saveProgress);
  const savedProgress = useLibraryStore((state) => (episodeUrl ? state.progress[episodeUrl] : undefined));

  const [variantPreference, setVariantPreference] = useState<AnimeVariant>(initialVariant ?? settingsVariant);

  const episodeLinks = useEpisodeLinks(episodeUrl);
  const animeInfo = useAnimeInfo(animeUrl);

  const variant = useMemo<AnimeVariant>(() => {
    const data = episodeLinks.data;
    if (!data) {
      return variantPreference;
    }
    if ((data.streamLinks[variantPreference]?.length ?? 0) > 0) {
      return variantPreference;
    }
    const other: AnimeVariant = variantPreference === 'SUB' ? 'DUB' : 'SUB';
    if ((data.streamLinks[other]?.length ?? 0) > 0) {
      return other;
    }
    return variantPreference;
  }, [episodeLinks.data, variantPreference]);

  const links = useMemo(
    () => episodeLinks.data?.streamLinks[variant] ?? [],
    [episodeLinks.data, variant]
  );

  const resolved = useResolvedStream(links, episodeLinks.isSuccess);

  const startAt = useMemo(() => {
    if (startAtParam > 5) {
      return startAtParam;
    }
    if (
      savedProgress &&
      savedProgress.positionSec > 5 &&
      savedProgress.durationSec > 0 &&
      savedProgress.positionSec < savedProgress.durationSec * 0.95
    ) {
      return savedProgress.positionSec;
    }
    return 0;
  }, [savedProgress, startAtParam]);

  const buildEntry = useCallback(
    (position: number, duration: number): WatchProgress | null => {
      if (!episodeUrl || !animeUrl) {
        return null;
      }
      return {
        animeUrl,
        animeTitle,
        animeImage,
        episodeUrl,
        episodeNumber,
        episodeTitle,
        positionSec: position,
        durationSec: duration,
        updatedAt: Date.now(),
      };
    },
    [animeImage, animeTitle, animeUrl, episodeNumber, episodeTitle, episodeUrl]
  );

  const progressRef = useRef({ position: startAt, duration: savedProgress?.durationSec ?? 0 });
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const entry = buildEntry(startAt, savedProgress?.durationSec ?? 0);
    if (entry) {
      saveProgress(entry);
    }
    return () => {
      const final = buildEntry(progressRef.current.position, progressRef.current.duration);
      if (final && final.positionSec > 5) {
        saveProgress(final);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeUrl, animeUrl]);

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      progressRef.current = { position, duration };
      const now = Date.now();
      if (now - lastSavedRef.current < 6000) {
        return;
      }
      lastSavedRef.current = now;
      const entry = buildEntry(position, duration);
      if (entry) {
        saveProgress(entry);
      }
    },
    [buildEntry, saveProgress]
  );

  const episodes = useMemo(() => animeInfo.data?.episodes ?? [], [animeInfo.data]);
  const currentIndex = useMemo(
    () => episodes.findIndex((episode) => episode.url === episodeUrl),
    [episodeUrl, episodes]
  );
  const nextEpisode = currentIndex >= 0 ? (episodes[currentIndex + 1] ?? null) : null;
  const prevEpisode = currentIndex > 0 ? (episodes[currentIndex - 1] ?? null) : null;

  const goToEpisode = (episode: Episode) => {
    if (!animeUrl) {
      return;
    }
    const entry = buildEntry(progressRef.current.position, progressRef.current.duration);
    if (entry) {
      saveProgress(entry);
    }
    router.replace({
      pathname: '/player',
      params: {
        episodeUrl: episode.url,
        animeUrl,
        animeTitle,
        animeImage: animeImage ?? '',
        episode: episode.number !== null ? String(episode.number) : '',
        episodeTitle: episode.title,
        startAt: '0',
        variant,
      },
    });
  };

  const handleEnded = () => {
    const entry = buildEntry(progressRef.current.duration, progressRef.current.duration);
    if (entry) {
      saveProgress(entry);
    }
    if (autoplayNext && nextEpisode) {
      goToEpisode(nextEpisode);
    }
  };

  const isLoadingLinks = episodeLinks.isLoading;
  const linksError = episodeLinks.isError;
  const resolvedError = resolved.isError;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SubpageHeader title={animeTitle} subtitle={episodeTitle} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.videoShell}>
          {isLoadingLinks ? (
            <View style={styles.videoPlaceholder}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.placeholderText}>Consultando fuentes del episodio...</Text>
            </View>
          ) : linksError ? (
            <View style={styles.videoPlaceholder}>
              <ErrorState
                compact
                title="No se pudieron obtener las fuentes"
                message={(episodeLinks.error as Error)?.message ?? 'Error inesperado.'}
                onRetry={() => void episodeLinks.refetch()}
              />
            </View>
          ) : links.length === 0 ? (
            <View style={styles.videoPlaceholder}>
              <EmptyState
                title="Sin fuentes disponibles"
                description="La API no devolvió servidores de streaming para este episodio. Puedes intentar con otro episodio o más tarde."
              />
            </View>
          ) : resolved.data ? (
            <StreamingVideo
              key={resolved.data.stream.streamUrl}
              uri={resolved.data.stream.streamUrl}
              startAt={startAt}
              autoplay
              onProgress={handleProgress}
              onEnded={handleEnded}
            />
          ) : resolvedError ? (
            <View style={styles.videoPlaceholder}>
              <ErrorState
                compact
                title="No se pudo resolver el video"
                message={(resolved.error as Error)?.message ?? 'Ningún servidor respondió con un enlace reproducible.'}
                onRetry={() => void resolved.refetch()}
              />
            </View>
          ) : (
            <View style={styles.videoPlaceholder}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.placeholderText}>
                Resolviendo servidor de video... esto puede tardar unos segundos.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.episodeTitle}>{episodeTitle}</Text>
          <Text style={styles.animeTitle}>{animeTitle}</Text>

          <View style={styles.chipsRow}>
            {resolved.data ? (
              <Chip label={`Fuente: ${resolved.data.link.server}`} />
            ) : (
              <Chip label="Fuente: resolviendo..." />
            )}
            {resolved.data ? <Chip label={resolved.data.stream.mediaType.toUpperCase()} /> : null}
            <Chip
              label="SUB"
              active={variant === 'SUB'}
              disabled={(episodeLinks.data?.streamLinks.SUB.length ?? 0) === 0 && variant !== 'SUB'}
              onPress={() => setVariantPreference('SUB')}
            />
            <Chip
              label="DUB"
              active={variant === 'DUB'}
              disabled={(episodeLinks.data?.streamLinks.DUB.length ?? 0) === 0 && variant !== 'DUB'}
              onPress={() => setVariantPreference('DUB')}
            />
          </View>

          <View style={styles.navigationRow}>
            <Pressable
              disabled={!prevEpisode}
              onPress={() => prevEpisode && goToEpisode(prevEpisode)}
              style={({ pressed }) => [
                styles.navButton,
                !prevEpisode && styles.navButtonDisabled,
                pressed && { opacity: 0.8 },
              ]}>
              <ChevronLeft size={16} color={colors.textPrimary} />
              <Text style={styles.navButtonText}>Anterior</Text>
            </Pressable>
            <Pressable
              disabled={!nextEpisode}
              onPress={() => nextEpisode && goToEpisode(nextEpisode)}
              style={({ pressed }) => [
                styles.navButton,
                !nextEpisode && styles.navButtonDisabled,
                pressed && { opacity: 0.8 },
              ]}>
              <Text style={styles.navButtonText}>Siguiente</Text>
              <ChevronRight size={16} color={colors.textPrimary} />
            </Pressable>
          </View>

          {resolved.data ? (
            <View style={styles.sourceNote}>
              <Server size={13} color={colors.textMuted} />
              <Text style={styles.sourceNoteText}>
                Enlace resuelto vía anime1v-api en {resolved.data.attempts}{' '}
                {resolved.data.attempts === 1 ? 'intento' : 'intentos'}. Los enlaces de video pueden expirar; si falla,
                usa «Reintentar».
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.playerBackground,
  },
  scrollContent: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  videoShell: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  placeholderText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  infoBlock: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: 16,
    gap: 10,
  },
  episodeTitle: typography.monoValue,
  animeTitle: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: colors.elevated,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  sourceNote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 6,
  },
  sourceNoteText: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textMuted,
  },
});
