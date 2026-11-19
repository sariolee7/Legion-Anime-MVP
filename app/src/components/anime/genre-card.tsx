import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { TruncatedTitle } from '@/components/common/truncated-title';
import { genreGradient } from '@/constants/genres';
import { colors, fonts, layout, typography } from '@/theme';

interface GenreCardProps {
  label: string;
  slug: string;
  image?: string | null;
  width?: number;
  onPress: () => void;
}

export function GenreCard({ label, slug, image, width = layout.posterWidthRail, onPress }: GenreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Explorar género ${label}`}
      style={({ pressed, ...state }) => [
        { width },
        (state as { hovered?: boolean }).hovered && styles.hover,
        pressed && { opacity: 0.85 },
      ]}
      {...(Platform.OS === 'web' ? { dataSet: { carousel: 'card' } } : {})}>
      <View style={[styles.cover, { width, aspectRatio: layout.posterAspect }]}>
        {image ? (
          <AppImage uri={image} radius={layout.cardRadius} brandedFallback style={StyleSheet.absoluteFill} />
        ) : (
          <LinearGradient colors={genreGradient(slug)} style={styles.fallback}>
            <Text style={styles.fallbackKicker}>GÉNERO</Text>
            <Text numberOfLines={2} style={styles.fallbackName}>
              {label}
            </Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.55)']}
          style={styles.bottomFade}
          pointerEvents="none"
        />
      </View>
      <TruncatedTitle text={label} style={styles.title} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.elevated,
  },
  hover: {
    transform: [{ scale: 1.025 }],
  },
  fallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 12,
    gap: 4,
  },
  fallbackKicker: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  fallbackName: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  title: {
    ...typography.cardTitle,
    marginTop: 6,
    minHeight: typography.cardTitle.lineHeight * 2,
  },
});
