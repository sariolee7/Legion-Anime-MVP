import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function SubpageHeader({ title, subtitle, right }: SubpageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.header}>
      <Pressable
        onPress={handleBack}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
        <ArrowLeft size={22} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  right: {
    alignItems: 'flex-end',
  },
});
