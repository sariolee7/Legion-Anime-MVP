import { useRouter } from 'expo-router';
import {
  ChevronRight,
  CircleUser,
  FileText,
  Info,
  LifeBuoy,
  Megaphone,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/components/anime/section-header';
import { AppHeader } from '@/components/common/app-header';
import { Screen } from '@/components/common/screen';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout } from '@/theme';

interface MenuItem {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
}

export function ProfileScreen() {
  const router = useRouter();
  const displayName = useSettingsStore((state) => state.displayName);
  const email = useSettingsStore((state) => state.email);

  const menuItems: MenuItem[] = [
    { label: 'Configuración', Icon: Settings, onPress: () => router.push('/settings') },
    { label: 'Términos de Servicio', Icon: FileText, onPress: () => router.push('/terms') },
    {
      label: 'Servicio al Cliente',
      Icon: LifeBuoy,
      onPress: () => void Linking.openURL('https://github.com/FxxMorgan/anime1v-api/issues'),
    },
    { label: 'Plataforma de ayuda', Icon: LifeBuoy, onPress: () => router.push('/help') },
    { label: 'Acerca de Legión Anime', Icon: Info, onPress: () => router.push('/about') },
  ];

  return (
    <Screen>
      <AppHeader />
      <SectionHeader title="Perfil y Cuenta" />

      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <CircleUser size={88} color={colors.iconMuted} strokeWidth={1.1} />
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Usuario</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>Correo</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <SectionHeader title="Anuncio" />
      <View style={styles.adCard} accessibilityLabel="Espacio reservado para publicidad">
        <View style={styles.adIcon}>
          <Megaphone size={20} color="#4A4A4A" />
        </View>
        <View style={styles.adBody}>
          <Text style={styles.adTitle}>Espacio publicitario</Text>
          <Text style={styles.adSubtitle}>Anuncio reservado para el prototipo</Text>
        </View>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>ANUNCIO</Text>
        </View>
      </View>

      <SectionHeader title="Ajustes y ayuda" />
      <View style={styles.menuCard}>
        {menuItems.map(({ label, Icon, onPress }, index) => (
          <Pressable
            key={label}
            onPress={onPress}
            style={({ pressed }) => [
              styles.menuRow,
              index < menuItems.length - 1 && styles.menuRowBorder,
              pressed && { opacity: 0.75 },
            ]}>
            <Icon size={17} color={colors.iconMuted} />
            <Text style={styles.menuLabel}>{label}</Text>
            <ChevronRight size={16} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileBlock: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 18,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.screenPadding,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
  },
  infoRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  infoLabel: {
    width: 74,
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textMuted,
  },
  infoValue: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  adCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: layout.screenPadding,
    backgroundColor: '#F2F2F2',
    borderRadius: layout.cardRadius,
    padding: 14,
    minHeight: 84,
  },
  adIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBody: {
    flex: 1,
    gap: 3,
  },
  adTitle: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 13,
    color: '#1C1C1C',
  },
  adSubtitle: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 16,
    color: '#6A6A6A',
  },
  adBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#1C1C1C',
  },
  adBadgeText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    letterSpacing: 0.8,
    color: '#F2F2F2',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.screenPadding,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
  },
});
