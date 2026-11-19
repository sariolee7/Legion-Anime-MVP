import { TriangleAlert } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

/**
 * Error discreto en la pantalla afectada. No expone estados internos de la API:
 * solo indica que el contenido no se pudo cargar y ofrece reintentar.
 */
export function ErrorState({ title = 'Contenido no disponible', message, onRetry, compact }: ErrorStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.iconWrap}>
        <TriangleAlert size={18} color={colors.error} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text numberOfLines={2} style={styles.message}>
          {message}
        </Text>
      </View>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          hitSlop={8}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: layout.screenPadding,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  compact: {
    marginTop: 0,
    paddingVertical: 9,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(242, 109, 109, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.uiMedium,
    fontSize: 12,
  },
  message: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.elevated,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.textPrimary,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
  },
});
