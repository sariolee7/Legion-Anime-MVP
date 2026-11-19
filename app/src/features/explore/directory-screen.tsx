import { useQueries } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Carousel, type CarouselItem } from '@/components/anime/carousel';
import { SectionHeader } from '@/components/anime/section-header';
import { AppHeader } from '@/components/common/app-header';
import { Screen } from '@/components/common/screen';
import { ANIME_TYPES, FEATURED_GENRES } from '@/constants/genres';
import { flattenCatalog, useCatalog } from '@/hooks/use-catalog';
import { fetchCatalog } from '@/services/anime/api';
import { useSettingsStore } from '@/stores/settings-store';

const FEATURED = FEATURED_GENRES;

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

  // Elige una portada distinta por género; además evita reutilizar las portadas
  // ya visibles en "En Emisión". Si no hay imágenes únicas, la tarjeta usa su
  // gradiente propio en lugar de repetir otra portada.
  const genreImages = new Map<string, string>();
  const usedImages = new Set<string>(airing.map((item) => item.image).filter((image): image is string => Boolean(image)));
  FEATURED.forEach((genre, index) => {
    const results = genreCoverQueries[index]?.data?.results ?? [];
    const match = results.find((item) => item.image && !usedImages.has(item.image));
    if (match?.image) {
      usedImages.add(match.image);
      genreImages.set(genre.slug, match.image);
    }
  });

  const airingItems: CarouselItem[] = airing.map((item) => ({
    key: item.url,
    title: item.title,
    image: item.image,
  }));

  const genreItems: CarouselItem[] = FEATURED.map((genre) => ({
    key: genre.slug,
    title: genre.name,
    slug: genre.slug,
    image: genreImages.get(genre.slug) ?? null,
  }));

  const typeItems: CarouselItem[] = ANIME_TYPES.map((type) => ({
    key: type.id,
    title: type.name,
  }));

  const openAnime = (item: CarouselItem) => {
    router.push({
      pathname: '/anime',
      params: { url: item.key, title: item.title, image: item.image ?? '' },
    });
  };

  const openGenre = (item: CarouselItem) => {
    router.push({ pathname: '/grid', params: { title: item.title, genre: item.key } });
  };

  const openType = (item: CarouselItem) => {
    router.push({ pathname: '/grid', params: { title: item.title, type: item.key } });
  };

  const catalogError = catalog.isError
    ? (catalog.error as Error)?.message ?? 'No se pudo cargar el directorio.'
    : undefined;

  return (
    <Screen refreshing={catalog.isRefetching} onRefresh={() => void catalog.refetch()}>
      <AppHeader />
      <SectionHeader title="Directorio" />
      <View>
        <Carousel
          title="En Emisión"
          items={airingItems}
          cardType="portada"
          loading={catalog.isLoading}
          errorMessage={catalogError}
          onRetry={() => void catalog.refetch()}
          actionLabel="Ver todo"
          onAction={() => router.push({ pathname: '/grid', params: { title: 'En Emisión' } })}
          onItemPress={openAnime}
          hideWhenEmpty={false}
          emptyMessage="Sin títulos disponibles por ahora."
        />

        <Carousel
          title="Géneros"
          items={genreItems}
          cardType="genero"
          loading={genreCoverQueries.some((query) => query.isLoading)}
          onItemPress={openGenre}
        />

        <Carousel
          title="Tipo"
          items={typeItems}
          cardType="tipo"
          onItemPress={openType}
        />
      </View>
    </Screen>
  );
}
