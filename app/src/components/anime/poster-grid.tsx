import type { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { PosterCard } from '@/components/anime/poster-card';
import { useResponsive } from '@/hooks/use-responsive';
import { colors, layout } from '@/theme';
import type { AnimeListItem } from '@/types/anime';

interface PosterGridProps {
  items: AnimeListItem[];
  header?: ReactElement | null;
  footer?: ReactElement | null;
  empty?: ReactElement | null;
  onEndReached?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onRemove?: (item: AnimeListItem) => void;
  paddingHorizontal?: number;
}

export function PosterGrid({
  items,
  header,
  footer,
  empty,
  onEndReached,
  refreshing = false,
  onRefresh,
  onRemove,
  paddingHorizontal = layout.screenPadding,
}: PosterGridProps) {
  const { width, isMobile, isDesktop } = useResponsive();

  const columns = isMobile ? 2 : isDesktop ? 5 : 3;
  const gap = isMobile ? layout.gridGap : layout.gridGapDesktop;
  const contentWidth = Math.min(width, layout.contentMaxWidth) - paddingHorizontal * 2;
  const itemWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  return (
    <FlatList
      key={`grid-${columns}`}
      data={items}
      keyExtractor={(item) => item.url}
      numColumns={columns}
      contentContainerStyle={styles.content}
      columnWrapperStyle={columns > 1 ? { gap } : undefined}
      ListHeaderComponent={header ?? undefined}
      ListFooterComponent={footer ?? undefined}
      ListEmptyComponent={empty ?? undefined}
      renderItem={({ item }) => (
        <View style={[styles.cell, { marginBottom: gap }]}>
          <PosterCard
            item={item}
            width={itemWidth}
            onRemove={onRemove ? () => onRemove(item) : undefined}
          />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.white}
            colors={[colors.white]}
            progressBackgroundColor={colors.elevated}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 120,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  cell: {
    flex: 1,
  },
});
