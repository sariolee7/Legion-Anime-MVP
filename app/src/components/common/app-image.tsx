import { LinearGradient } from 'expo-linear-gradient';
import { ImageOff } from 'lucide-react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/theme';
import { resolveImageSource } from '@/utils/image';

interface AppImageProps {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  radius?: number;
  /** Muestra la marca en el respaldo cuando la portada falla. */
  brandedFallback?: boolean;
  /** Carga diferida en web (desactivada para el hero). */
  lazy?: boolean;
}

export function AppImage({
  uri,
  style,
  contentFit = 'cover',
  radius = 0,
  brandedFallback = false,
  lazy = true,
}: AppImageProps) {
  const [failed, setFailed] = useState(false);
  const source = resolveImageSource(uri);

  if (!source || failed) {
    return (
      <LinearGradient
        colors={['#2E2E2E', '#1B1B1B']}
        style={[styles.fallback, { borderRadius: radius }, style]}>
        <ImageOff size={20} color={colors.textMuted} />
        {brandedFallback ? <Text style={styles.brand}>LEGIÓN</Text> : null}
      </LinearGradient>
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={[{ backgroundColor: colors.placeholder, borderRadius: radius }, style as StyleProp<ImageStyle>]}
      contentFit={contentFit}
      transition={180}
      cachePolicy="memory-disk"
      recyclingKey={uri ?? undefined}
      loading={lazy ? 'lazy' : 'eager'}
      priority={lazy ? 'normal' : 'high'}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  brand: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
  },
});
