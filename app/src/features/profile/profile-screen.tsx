import { useRouter } from 'expo-router';
import {
  ChevronRight,
  CircleUser,
  FileText,
  Info,
  LifeBuoy,
  Settings,
  type LucideIcon,
} from 'lucide-react-native';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/common/app-header';
import { Chip } from '@/components/common/chip';
import { Screen } from '@/components/common/screen';
import { SectionHeader } from '@/components/anime/section-header';
import { useApiHealth } from '@/hooks/use-api-health';
import { describeApiTarget } from '@/services/anime/api';
import { useLibraryStore } from '@/stores/library-store';
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
  const favoriteCount = useLibraryStore((state) => state.lists.favorite.length);
  const completedCount = useLibraryStore((state) => state.lists.completed.length);
  const historyCount = useLibraryStore((state) => state.history.length);
  const health = useApiHealth();
  const online = health.data === true;

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
          <CircleUser size={84} color={colors.iconMuted} strokeWidth={1.2} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.platform}>Plataforma local · sin cuenta</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoRow}>Usuario: {displayName}</Text>
        <Text style={styles.infoRow}>Favoritos: {favoriteCount}</Text>
        <Text style={styles.infoRow}>Terminados: {completedCount}</Text>
        <Text style={styles.infoRow}>Historial: {historyCount}</Text>
      </View>

      <SectionHeader title="Servicio" />
      <View style={styles.infoCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: online ? colors.success : colors.error }]} />
          <Text style={styles.statusLabel}>{online ? 'API conectada' : 'API desconectada'}</Text>
          <Chip label="Probar conexión" onPress={() => void health.refetch()} />
        </View>
        <Text style={styles.apiUrl}>{describeApiTarget()}</Text>
        <Text style={styles.credit}>
          Datos y streaming: anime1v-api por FxxMorgan (open source, MIT).
        </Text>
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
    paddingVertical: 16,
    gap: 8,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  platform: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.screenPadding,
    padding: 16,
    gap: 8,
  },
  infoRow: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  apiUrl: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  credit: {
    fontFamily: fonts.ui,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textMuted,
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
    height: 46,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
