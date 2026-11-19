import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GenreCard } from '@/components/anime/genre-card';
import { PosterCard } from '@/components/anime/poster-card';
import { Rail } from '@/components/anime/rail';
import { SectionHeader } from '@/components/anime/section-header';
import { TypeCard } from '@/components/anime/type-card';
import { AppHeader } from '@/components/common/app-header';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Screen } from '@/components/common/screen';
import { PosterSkeleton } from '@/components/common/skeleton';
import { ANIME_TYPES, FEATURED_GENRES } from '@/constants/genres';
import { flattenCatalog, useCatalog } from '@/hooks/use-catalog';
import { fetchCatalog } from '@/services/anime/api';
import { useSettingsStore } from '@/stores/settings-store';
import { colors } from '@/theme';

const FEATURED = FEATURED_GENRES.slice(0, 6);

export function DirectoryScreen() {
  const router = useRouter();
  const provider = useSettingsStore((state) => state.provider);
  const catalog = useCatalog({ provider });
  const items = useMemo(() => flattenCatalog(catalog.data), [catalog.data]);
  const airing = items.slice(0, 12);

  const genreCoverQueries = useQueries({
    queries: FEATURED.map((genre) => ({
      queryKey: ['genre-cover', provider, genre.slug],
      queryFn: () => fetchCatalog({ genre: genre.slug, provider }),
      staleTime: 6 * 60 * 60_000,
      retry: 0,
    })),
  });

  const failed = catalog.isError && items.length === 0;

  return (
    <Screen refreshing={catalog.isRefetching} onRefresh={() => void catalog.refetch()}>
      <AppHeader />
      <SectionHeader title="Directorio" />

      {catalog.isLoading ? (
        <View>
          <SectionHeader title="En Emisión" />
          <View style={styles.surfaceBlock}>
            <Rail>
              {[0, 1, 2, 3].map((key) => (
                <PosterSkeleton key={key} />
              ))}
            </Rail>
          </View>
          <SectionHeader title="Géneros" />
          <View style={styles.surfaceBlock}>
            <Rail>
              {[0, 1, 2, 3].map((key) => (
                <PosterSkeleton key={key} />
              ))}
            </Rail>
          </View>
        </View>
      ) : failed ? (
        <ErrorState
          title="No se pudo cargar el directorio"
          message={(catalog.error as Error)?.message ?? 'Error inesperado.'}
          onRetry={() => void catalog.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Sin títulos disponibles"
          description="La API no devolvió resultados para este proveedor."
          actionLabel="Reintentar"
          onAction={() => void catalog.refetch()}
        />
      ) : (
        <View>
          <SectionHeader
            title="En Emisión"
            actionLabel="Ver todo"
            onAction={() => router.push({ pathname: '/grid', params: { title: 'En Emisión' } })}
          />
          <View style={styles.surfaceBlock}>
            <Rail>
              {airing.map((item) => (
                <PosterCard key={item.url} item={item} />
              ))}
            </Rail>
          </View>

          <SectionHeader title="Géneros" />
          <View style={styles.surfaceBlock}>
            <Rail>
              {FEATURED.map((genre, index) => (
                <GenreCard
                  key={genre.slug}
                  label={genre.name}
                  image={genreCoverQueries[index]?.data?.results[0]?.image ?? null}
                  onPress={() =>
                    router.push({
                      pathname: '/grid',
                      params: { title: genre.name, genre: genre.slug },
                    })
                  }
                />
              ))}
            </Rail>
          </View>

          <SectionHeader title="Tipo" />
          <View style={styles.surfaceBlock}>
            <Rail>
              {ANIME_TYPES.map((type) => (
                <TypeCard
                  key={type.id}
                  label={type.name}
                  symbol={type.name.charAt(0)}
                  onPress={() =>
                    router.push({
                      pathname: '/grid',
                      params: { title: type.name, type: type.id },
                    })
                  }
                />
              ))}
            </Rail>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  surfaceBlock: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
  },
});
