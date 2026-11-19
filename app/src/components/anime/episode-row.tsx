import { EyeOff, Heart, ListPlus, Play } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { TruncatedTitle } from '@/components/common/truncated-title';
import { colors, fonts, layout } from '@/theme';

interface EpisodeRowProps {
  image: string | null | undefined;
  title: string;
  subtitle: string;
  progress?: number;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isInList?: boolean;
  onAddToList?: () => void;
  isDiscarded?: boolean;
  onToggleDiscarded?: () => void;
}

interface RowActionProps {
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  active?: boolean;
  label: string;
  onPress: () => void;
}

function RowAction({ Icon, active = false, label, onPress }: RowActionProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.65 }]}>
      <Icon size={18} color={active ? colors.white : colors.textMuted} strokeWidth={active ? 2.2 : 1.8} />
    </Pressable>
  );
}

export function EpisodeRow({
  image,
  title,
  subtitle,
  progress,
  onPress,
  isFavorite,
  onToggleFavorite,
  isInList,
  onAddToList,
  isDiscarded,
  onToggleDiscarded,
}: EpisodeRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Reproducir ${title}, ${subtitle}`}
        style={({ pressed }) => [styles.thumbPress, pressed && { opacity: 0.85 }]}>
        <View style={styles.thumb}>
          <AppImage uri={image} radius={8} brandedFallback style={StyleSheet.absoluteFill} />
        </View>
      </Pressable>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Reproducir ${title}, ${subtitle}`}
        style={({ pressed }) => [styles.body, pressed && { opacity: 0.82 }]}>
        <TruncatedTitle text={title} style={styles.title} />
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
        {typeof progress === 'number' && progress > 0 ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, Math.round(progress * 100))}%` }]} />
          </View>
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        {onToggleFavorite ? (
          <RowAction
            Icon={Heart}
            active={isFavorite}
            label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onPress={onToggleFavorite}
          />
        ) : null}
        {onAddToList ? (
          <RowAction
            Icon={ListPlus}
            active={isInList}
            label={isInList ? 'Quitar de Ver Luego' : 'Agregar a Ver Luego'}
            onPress={onAddToList}
          />
        ) : null}
        {onToggleDiscarded ? (
          <RowAction
            Icon={EyeOff}
            active={isDiscarded}
            label={isDiscarded ? 'Quitar de descartados' : 'Marcar como no visto'}
            onPress={onToggleDiscarded}
          />
        ) : null}
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Reproducir ${title}`}
          style={({ pressed }) => [styles.playHint, pressed && { opacity: 0.7 }]}>
          <Play size={13} color={colors.white} fill={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: layout.cardRadius,
    padding: 8,
    paddingRight: 12,
    gap: 10,
  },
  thumbPress: {
    borderRadius: 8,
  },
  thumb: {
    width: layout.episodeThumbWidth,
    height: layout.episodeThumbHeight,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  body: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: layout.episodeThumbHeight,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  progressTrack: {
    height: 2,
    width: '70%',
    backgroundColor: colors.border,
    borderRadius: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 26,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playHint: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
});
