import { usePathname, useRouter } from 'expo-router';
import { CircleUser, Heart, Home, LayoutGrid, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/common/brand-logo';
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

  return (
    <View style={styles.sidebar}>
      <Pressable onPress={() => router.push('/')} style={styles.brand}>
        <BrandLogo size={46} />
        <View style={styles.brandText}>
          <Text style={styles.brandKicker}>LEGIÓN</Text>
          <Text style={styles.brandName}>ANIME</Text>
        </View>
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
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 6,
  },
  brandText: {
    gap: 1,
  },
  brandKicker: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 4,
    color: colors.textMuted,
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 28,
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
    borderRadius: layout.cardRadius,
  },
  navItemActive: {
    backgroundColor: colors.elevated,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
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
});
