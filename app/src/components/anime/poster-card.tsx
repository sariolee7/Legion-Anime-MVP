import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { TruncatedTitle } from '@/components/common/truncated-title';
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
        style={({ pressed, ...state }) => [
          (state as { hovered?: boolean }).hovered && styles.hover,
          pressed && { opacity: 0.82 },
        ]}
        {...(Platform.OS === 'web' ? { dataSet: { carousel: 'card' } } : {})}>
        <View style={[styles.posterContainer, { width, aspectRatio: layout.posterAspect }]}>
          <AppImage
            uri={item.image}
            radius={layout.cardRadius}
            brandedFallback
            style={StyleSheet.absoluteFill}
          />
          {typeof progress === 'number' && progress > 0 ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, Math.round(progress * 100))}%` }]} />
            </View>
          ) : null}
        </View>
        <TruncatedTitle text={item.title} style={styles.title} />
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
  hover: {
    transform: [{ scale: 1.025 }],
  },
  title: {
    ...typography.cardTitle,
    marginTop: 6,
    minHeight: typography.cardTitle.lineHeight * 2,
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
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
