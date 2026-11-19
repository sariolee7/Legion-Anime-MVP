import { usePathname, useRouter } from 'expo-router';
import { CircleUser, Heart, Home, LayoutGrid, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApiHealth } from '@/hooks/use-api-health';
import { describeApiTarget } from '@/services/anime/api';
import { colors, fonts, layout } from '@/theme';

interface NavItem {
  href: '/' | '/listas' | '/directorio' | '/perfil';
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', Icon: Home },
  { href: '/listas', label: 'Listas', Icon: Heart },
  { href: '/directorio', label: 'Directorio', Icon: LayoutGrid },
  { href: '/perfil', label: 'Perfil', Icon: CircleUser },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const health = useApiHealth();
  const online = health.data === true;

  return (
    <View style={styles.sidebar}>
      <Pressable onPress={() => router.push('/')} style={styles.brand}>
        <Text style={styles.brandKicker}>LEGIÓN</Text>
        <Text style={styles.brandName}>ANIME</Text>
        <Text style={styles.brandTag}>STREAMING MVP</Text>
      </Pressable>

      <View style={styles.nav}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Pressable
              key={href}
              onPress={() => router.push(href)}
              accessibilityRole="link"
              accessibilityState={active ? { selected: true } : {}}
              style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && { opacity: 0.8 }]}>
              <View style={[styles.activeBar, active && styles.activeBarVisible]} />
              <Icon size={18} color={active ? colors.white : colors.iconMuted} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.statusRow, pressed && { opacity: 0.8 }]}>
          <View style={[styles.statusDot, { backgroundColor: online ? colors.success : colors.error }]} />
          <Text style={styles.statusText}>{online ? 'API conectada' : 'API desconectada'}</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.apiUrl}>
          {describeApiTarget()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth,
    backgroundColor: colors.surface,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
    paddingVertical: 28,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  brand: {
    paddingHorizontal: 10,
    gap: 2,
  },
  brandKicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 6,
    color: colors.textMuted,
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.textPrimary,
    lineHeight: 34,
  },
  brandTag: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 3,
    color: colors.textMuted,
  },
  nav: {
    flex: 1,
    marginTop: 36,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingLeft: 14,
    borderRadius: 4,
  },
  navItemActive: {
    backgroundColor: colors.elevated,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: colors.white,
  },
  navLabel: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: colors.iconMuted,
  },
  navLabelActive: {
    color: colors.white,
    fontFamily: fonts.uiMedium,
  },
  footer: {
    gap: 6,
    paddingHorizontal: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
  apiUrl: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
});
