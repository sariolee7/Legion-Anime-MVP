import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EpisodeRow } from '@/components/anime/episode-row';
import { PosterGrid } from '@/components/anime/poster-grid';
import { SectionHeader } from '@/components/anime/section-header';
import { AppHeader } from '@/components/common/app-header';
import { EmptyState } from '@/components/common/empty-state';
import { Screen } from '@/components/common/screen';
import { useLibraryStore } from '@/stores/library-store';
import { colors, fonts, layout } from '@/theme';
import type { AnimeListItem, LibraryStatus, SavedAnime, WatchProgress } from '@/types/anime';
import { progressRatio } from '@/utils/format';

type LibraryTabId = LibraryStatus | 'history';

const LIBRARY_TABS: { id: LibraryTabId; label: string }[] = [
  { id: 'favorite', label: 'Favoritos' },
  { id: 'following', label: 'Siguiendo' },
  { id: 'watchLater', label: 'Ver Luego' },
  { id: 'completed', label: 'Terminados' },
  { id: 'history', label: 'Últimos 30 Vistos' },
  { id: 'discarded', label: 'Descartados' },
];

function savedToListItem(saved: SavedAnime): AnimeListItem {
  return {
    id: null,
    title: saved.title,
    slug: saved.slug,
    url: saved.url,
    image: saved.image,
    backdrop: null,
    type: saved.type,
    score: saved.score,
    status: null,
    year: saved.year,
    provider: saved.provider,
  };
}

export function LibraryScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<LibraryTabId>('favorite');
  const lists = useLibraryStore((state) => state.lists);
  const history = useLibraryStore((state) => state.history);
  const removeFromList = useLibraryStore((state) => state.removeFromList);
  const clearHistory = useLibraryStore((state) => state.clearHistory);

  const activeLabel = LIBRARY_TABS.find((tab) => tab.id === selected)?.label ?? 'Favoritos';

  const items = useMemo(() => {
    if (selected === 'history') {
      return [];
    }
    return lists[selected].map(savedToListItem);
  }, [lists, selected]);

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

  const handleRemove = (item: AnimeListItem) => {
    if (selected !== 'history') {
      removeFromList(selected, item.url);
    }
  };

  return (
    <Screen scroll={false}>
      <AppHeader />

      <View style={styles.tabStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabStripContent}>
          {LIBRARY_TABS.map((tab) => {
            const active = tab.id === selected;
            return (
              <Pressable key={tab.id} onPress={() => setSelected(tab.id)} style={styles.tabButton}>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {selected === 'history' ? (
        <FlatList
          data={history}
          keyExtractor={(entry) => entry.episodeUrl}
          contentContainerStyle={styles.historyContent}
          ListHeaderComponent={
            <View style={styles.historyHeader}>
              <SectionHeader title="Últimos 30 Vistos" />
              {history.length > 0 ? (
                <Pressable onPress={clearHistory} hitSlop={8} style={styles.clearButton}>
                  <Trash2 size={14} color={colors.textMuted} />
                  <Text style={styles.clearText}>Limpiar</Text>
                </Pressable>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title="Tu historial está vacío"
              description="Los episodios que reproduzcas aparecerán aquí automáticamente."
              actionLabel="Explorar catálogo"
              onAction={() => router.push('/directorio')}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <EpisodeRow
                image={item.animeImage}
                title={item.animeTitle}
                subtitle={`Episodio ${item.episodeNumber ?? '?'}`}
                progress={progressRatio(item)}
                onPress={() => openPlayer(item)}
              />
            </View>
          )}
        />
      ) : (
        <PosterGrid
          items={items}
          onRemove={handleRemove}
          header={<SectionHeader title={activeLabel} inset={false} />}
          empty={
            <EmptyState
              title={`Sin títulos en ${activeLabel}`}
              description="Agrega animes desde su ficha de detalle para verlos aquí."
              actionLabel="Explorar catálogo"
              onAction={() => router.push('/directorio')}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabStrip: {
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabStripContent: {
    paddingHorizontal: layout.sectionPaddingH,
    gap: 24,
    alignItems: 'center',
  },
  tabButton: {
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 5,
  },
  tabLabel: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.white,
  },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: colors.white,
  },
  historyContent: {
    paddingBottom: 120,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: layout.sectionPaddingH,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearText: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
  historyRow: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: 10,
  },
});
