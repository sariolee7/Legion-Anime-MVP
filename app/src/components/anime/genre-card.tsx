import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { colors, layout, typography } from '@/theme';

interface GenreCardProps {
  label: string;
  image?: string | null;
  width?: number;
  onPress: () => void;
}

export function GenreCard({ label, image, width = layout.posterWidthRail, onPress }: GenreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Explorar género ${label}`}
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.85 }]}>
      <View style={[styles.cover, { width, aspectRatio: layout.posterAspect }]}>
        {image ? (
          <AppImage uri={image} radius={layout.cardRadius} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.fallback}>
            <Text style={styles.fallbackLetter}>{label.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.elevated,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
  },
  fallbackLetter: {
    fontFamily: 'Calistoga_400Regular',
    fontSize: 44,
    color: colors.border,
  },
  title: {
    ...typography.cardTitle,
    marginTop: 4,
  },
});
