import type { BottomTabBarProps } from 'expo-router/tabs';
import { CircleUser, Heart, Home, LayoutGrid, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

const TAB_META: Record<string, { label: string; Icon: LucideIcon }> = {
  index: { label: 'Inicio', Icon: Home },
  listas: { label: 'Listas', Icon: Heart },
  directorio: { label: 'Directorio', Icon: LayoutGrid },
  perfil: { label: 'Perfil', Icon: CircleUser },
};

export function AppTabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TAB_META[route.name] ?? { label: route.name, Icon: Home };

        return (
          <Pressable
            key={route.key}
            onPress={() => navigateToTab(route.key)}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}>
            <meta.Icon
              size={23}
              color={focused ? colors.white : colors.iconMuted}
              strokeWidth={focused ? 2.2 : 1.7}
            />
            <Text style={[styles.label, focused && styles.labelActive]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: {
    flex: 1,
    height: layout.navBarHeight - 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  label: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.white,
    fontFamily: fonts.uiMedium,
  },
});
