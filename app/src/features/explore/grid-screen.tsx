import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PosterGrid } from '@/components/anime/poster-grid';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PosterSkeleton } from '@/components/common/skeleton';
import { SubpageHeader } from '@/components/common/subpage-header';
import { ANIME_TYPES } from '@/constants/genres';
import { flattenCatalog, useCatalog } from '@/hooks/use-catalog';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout } from '@/theme';

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function GridScreen() {
  const params = useLocalSearchParams<{ title?: string; genre?: string; type?: string }>();
  const title = first(params.title) ?? 'Catálogo';
  const genre = first(params.genre);
  const type = first(params.type);

  const provider = useSettingsStore((state) => state.provider);
  const catalog = useCatalog({ provider, genre });

  const items = useMemo(() => {
    const all = flattenCatalog(catalog.data);
    if (!type) {
      return all;
    }
    const matchers = ANIME_TYPES.find((candidate) => candidate.id === type)?.matchers ?? [];
    if (matchers.length === 0) {
      return all;
    }
    return all.filter((item) => {
      const value = (item.type ?? '').toLowerCase();
      return matchers.some((matcher) => value.includes(matcher));
    });
  }, [catalog.data, type]);

  const countLabel = catalog.hasNextPage ? `${items.length}+ títulos` : `${items.length} títulos`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SubpageHeader title={title} subtitle={catalog.isLoading ? 'Cargando...' : countLabel} />

      {catalog.isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <PosterSkeleton key={index} width={160} />
          ))}
        </View>
      ) : catalog.isError && items.length === 0 ? (
        <ErrorState
          title="No se pudo cargar el catálogo"
          message={(catalog.error as Error)?.message ?? 'Error inesperado.'}
          onRetry={() => void catalog.refetch()}
        />
      ) : (
        <PosterGrid
          items={items}
          onEndReached={() => {
            if (catalog.hasNextPage && !catalog.isFetchingNextPage) {
              void catalog.fetchNextPage();
            }
          }}
          refreshing={catalog.isRefetching && !catalog.isFetchingNextPage}
          onRefresh={() => void catalog.refetch()}
          empty={
            <EmptyState
              title="Sin resultados"
              description="No hay títulos para este filtro en el catálogo del proveedor actual."
            />
          }
          footer={
            catalog.isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {catalog.hasNextPage ? 'Desliza para cargar más' : 'Fin del catálogo'}
                </Text>
              </View>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.gridGap,
    padding: layout.screenPadding,
  },
  footer: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
});
