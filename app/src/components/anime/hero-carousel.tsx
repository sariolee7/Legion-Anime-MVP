import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { useResponsive } from '@/hooks/use-responsive';
import { colors, layout, typography } from '@/theme';
import type { AnimeListItem } from '@/types/anime';

export function HeroCarousel({ items }: { items: AnimeListItem[] }) {
  const router = useRouter();
  const { width } = useResponsive();
  const cardWidth = Math.min(layout.heroCardWidth, width - 30);
  const cardHeight = Math.round(cardWidth * (layout.heroCardHeight / layout.heroCardWidth));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={cardWidth + 12}
      snapToAlignment="start"
      contentContainerStyle={styles.content}>
      {items.map((item) => (
        <Pressable
          key={item.url}
          onPress={() =>
            router.push({
              pathname: '/anime',
              params: { url: item.url, title: item.title, image: item.image ?? '' },
            })
          }
          accessibilityRole="button"
          accessibilityLabel={`Ver ${item.title}`}
          style={({ pressed }) => [
            styles.card,
            { width: cardWidth, height: cardHeight },
            pressed && { opacity: 0.85 },
          ]}>
          <AppImage uri={item.image} style={StyleSheet.absoluteFill} />
          <View style={styles.titleBar}>
            <Text numberOfLines={1} style={typography.heroTitle}>
              {item.title}
            </Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    gap: 12,
  },
  card: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
    justifyContent: 'flex-end',
  },
  titleBar: {
    height: layout.heroTitleBarHeight,
    backgroundColor: colors.titleBar,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
