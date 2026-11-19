import { useRouter } from 'expo-router';
import { Search, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '@/hooks/use-responsive';
import { colors, fonts, layout } from '@/theme';

export function AppHeader() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.push('/perfil')}
        accessibilityRole="button"
        accessibilityLabel="Ir al perfil"
        style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.8 }]}>
        <UserRound size={30} color={colors.iconMuted} />
      </Pressable>

      {isMobile ? (
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="Buscar anime"
          hitSlop={8}
          style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
          <Search size={26} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel="Buscar anime"
          style={({ pressed }) => [styles.searchBar, pressed && { opacity: 0.8 }]}>
          <Search size={18} color={colors.textMuted} />
          <Text style={styles.searchText}>Buscar anime...</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.headerPaddingH,
    paddingVertical: 7,
    minHeight: 80,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    paddingHorizontal: 12,
    height: 40,
    width: 280,
  },
  searchText: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
});
