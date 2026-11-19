import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/theme';

interface BrandLogoProps {
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Logo redondo de Legión Anime. Se dibuja con el monograma de la marca para
 * mantenerlo nítido en cualquier tamaño y no depender de un asset externo.
 */
export function BrandLogo({ size = 42, onPress, style }: BrandLogoProps) {
  const content = (
    <LinearGradient
      colors={['#3B3B3B', '#161616']}
      start={{ x: 0.15, y: 0.1 }}
      end={{ x: 0.85, y: 0.95 }}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}>
      <Text style={[styles.mark, { fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.5) }]}>
        LA
      </Text>
    </LinearGradient>
  );

  if (!onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ir al inicio"
      style={({ pressed }) => [style, pressed && { opacity: 0.8 }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: colors.elevated,
  },
  mark: {
    fontFamily: fonts.display,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
