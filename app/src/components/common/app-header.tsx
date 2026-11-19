import { useRouter } from 'expo-router';
import { CircleUser, Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/common/brand-logo';
import { useResponsive } from '@/hooks/use-responsive';
import { colors, fonts, layout } from '@/theme';

export function AppHeader() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <View style={styles.mobileHeader}>
        <BrandLogo size={42} onPress={() => router.push('/')} />
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="Buscar anime"
          hitSlop={10}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
          <Search size={24} color={colors.textPrimary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.desktopHeader}>
      <View style={styles.desktopRight}>
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel="Buscar anime"
          style={({ pressed }) => [styles.searchBar, pressed && { opacity: 0.85 }]}>
          <Search size={17} color={colors.textMuted} />
          <Text style={styles.searchText}>Buscar anime...</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Ir al perfil"
          style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}>
          <CircleUser size={24} color={colors.textSecondary} strokeWidth={1.6} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.headerPaddingH,
    paddingVertical: 10,
    minHeight: layout.headerHeight,
  },
  desktopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  desktopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    paddingHorizontal: 12,
    height: 40,
    width: 300,
  },
  searchText: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
