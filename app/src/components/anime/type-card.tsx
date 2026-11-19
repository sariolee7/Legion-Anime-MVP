import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout, typography } from '@/theme';

interface TypeCardProps {
  label: string;
  symbol: string;
  width?: number;
  onPress: () => void;
}

export function TypeCard({ label, symbol, width = layout.posterWidthRail, onPress }: TypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${label}`}
      style={({ pressed }) => [{ width }, pressed && { opacity: 0.85 }]}>
      <View style={[styles.cover, { width, aspectRatio: layout.posterAspect }]}>
        <Text style={styles.symbol}>{symbol}</Text>
        <View style={styles.stripe} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.textMuted,
    opacity: 0.55,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: colors.border,
  },
  title: {
    ...typography.cardTitle,
    marginTop: 4,
  },
});
