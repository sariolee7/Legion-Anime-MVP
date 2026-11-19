import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

interface TypeCardProps {
  label: string;
  width?: number;
  onPress: () => void;
}

const TYPE_GRADIENTS: Record<string, readonly [string, string]> = {
  Anime: ['#3B4C6B', '#12161E'],
  Película: ['#6B3B54', '#1E1218'],
  OVA: ['#4B6B3B', '#131E12'],
};

export function TypeCard({ label, width = layout.posterWidthRail, onPress }: TypeCardProps) {
  const colorsPair = TYPE_GRADIENTS[label] ?? ['#333333', '#141414'];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${label}`}
      style={({ pressed, ...state }) => [
        { width },
        (state as { hovered?: boolean }).hovered && styles.hover,
        pressed && { opacity: 0.85 },
      ]}
      {...(Platform.OS === 'web' ? { dataSet: { carousel: 'card' } } : {})}>
      <LinearGradient
        colors={colorsPair}
        start={{ x: 0.1, y: 0.05 }}
        end={{ x: 0.9, y: 0.95 }}
        style={[styles.cover, { width, aspectRatio: layout.posterAspect }]}>
        <View style={styles.innerRing} />
        <Text numberOfLines={2} style={styles.label}>
          {label}
        </Text>
        <Text style={styles.caption}>VER CATÁLOGO</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  hover: {
    transform: [{ scale: 1.025 }],
  },
  innerRing: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: layout.cardRadius - 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 23,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  caption: {
    fontFamily: fonts.mono,
    fontSize: 7,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.55)',
  },
});
