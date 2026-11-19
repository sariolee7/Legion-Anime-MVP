import { TriangleAlert } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ title = 'Algo salió mal', message, onRetry, compact }: ErrorStateProps) {
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <TriangleAlert size={compact ? 26 : 34} color={colors.error} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 8,
  },
  compact: {
    paddingVertical: 20,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 15,
    marginTop: 4,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 420,
  },
  button: {
    marginTop: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 3,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.black,
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
  },
});
