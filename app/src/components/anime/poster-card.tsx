import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { colors, layout, typography } from '@/theme';
import type { AnimeListItem } from '@/types/anime';

interface PosterCardProps {
  item: AnimeListItem;
  width?: number;
  progress?: number;
  onRemove?: () => void;
  onPress?: () => void;
}

export function PosterCard({ item, width = layout.posterWidthRail, progress, onRemove, onPress }: PosterCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    router.push({
      pathname: '/anime',
      params: { url: item.url, title: item.title, image: item.image ?? '' },
    });
  };

  return (
    <View style={{ width }}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${item.title}`}
        style={({ pressed }) => [pressed && { opacity: 0.82 }]}>
        <View style={[styles.posterContainer, { width, aspectRatio: layout.posterAspect }]}>
          <AppImage uri={item.image} radius={layout.cardRadius} style={StyleSheet.absoluteFill} />
          {typeof progress === 'number' && progress > 0 ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, Math.round(progress * 100))}%` }]} />
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>
      </Pressable>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${item.title}`}
          style={styles.removeButton}>
          <X size={13} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  posterContainer: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  title: {
    ...typography.cardTitle,
    marginTop: 4,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.white,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
