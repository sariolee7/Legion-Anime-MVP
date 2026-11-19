import { Image, type ImageContentFit } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';
import { resolveImageSource } from '@/utils/image';

interface AppImageProps {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  radius?: number;
}

export function AppImage({ uri, style, contentFit = 'cover', radius = 0 }: AppImageProps) {
  const [failed, setFailed] = useState(false);
  const source = resolveImageSource(uri);

  if (!source || failed) {
    return (
      <View style={[styles.fallback, { borderRadius: radius }, style]}>
        <ImageOff size={20} color={colors.textMuted} />
      </View>
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
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
