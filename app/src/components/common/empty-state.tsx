import { Clapperboard } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Clapperboard size={32} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 15,
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 380,
  },
  button: {
    marginTop: 8,
    backgroundColor: colors.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: layout.cardRadius,
  },
  buttonText: {
    color: colors.textPrimary,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
  },
});
