import { CircleCheckBig, Heart, Play } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppImage } from '@/components/common/app-image';
import { colors, fonts, layout } from '@/theme';

interface EpisodeRowProps {
  image: string | null | undefined;
  title: string;
  subtitle: string;
  progress?: number;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isCompleted?: boolean;
  onToggleCompleted?: () => void;
}

export function EpisodeRow({
  image,
  title,
  subtitle,
  progress,
  onPress,
  isFavorite,
  onToggleFavorite,
  isCompleted,
  onToggleCompleted,
}: EpisodeRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Reproducir ${title}, ${subtitle}`}
        style={({ pressed }) => [styles.thumbPress, pressed && { opacity: 0.85 }]}>
        <View style={styles.thumb}>
          <AppImage uri={image} radius={layout.cardRadius} style={StyleSheet.absoluteFill} />
        </View>
      </Pressable>

      <View style={styles.body}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Reproducir ${title}, ${subtitle}`}
          style={({ pressed }) => [styles.textPress, pressed && { opacity: 0.82 }]}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
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
            <Pressable
              onPress={onToggleFavorite}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
              <Heart
                size={22}
                color={isFavorite ? colors.white : colors.textSecondary}
                fill={isFavorite ? colors.white : 'transparent'}
              />
            </Pressable>
          ) : null}
          {onToggleCompleted ? (
            <Pressable
              onPress={onToggleCompleted}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={isCompleted ? 'Marcar como no visto' : 'Marcar como visto'}>
              <CircleCheckBig
                size={20}
                color={isCompleted ? colors.white : colors.textSecondary}
              />
            </Pressable>
          ) : null}
          <View style={styles.playHint}>
            <Play size={14} color={colors.white} fill={colors.white} />
          </View>
        </View>
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
    paddingRight: 16,
    gap: 12,
  },
  thumbPress: {
    borderRadius: layout.cardRadius,
  },
  thumb: {
    width: layout.episodeThumbSize,
    height: layout.episodeThumbSize,
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
  },
  body: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  textPress: {
    gap: 3,
  },
  title: {
    color: colors.textSecondary,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 17,
  },
  progressTrack: {
    height: 2,
    width: '60%',
    backgroundColor: colors.border,
    borderRadius: 1,
    marginTop: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playHint: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
