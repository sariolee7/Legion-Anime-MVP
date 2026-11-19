import { TriangleAlert } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout } from '@/theme';

interface ApiErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

/**
 * Aviso discreto para fallos puntuales de la API. Solo se renderiza cuando la
 * consulta falla; si todo va bien no ocupa espacio ni muestra estado técnico.
 */
export function ApiErrorBanner({ message, onRetry }: ApiErrorBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <TriangleAlert size={16} color={colors.error} />
      <Text numberOfLines={2} style={styles.message}>
        {message ?? 'No se pudo actualizar el contenido. Revisa tu conexión.'}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Text style={styles.retry}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: layout.screenPadding,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: layout.cardRadius,
    backgroundColor: 'rgba(242, 109, 109, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(242, 109, 109, 0.35)',
  },
  message: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  retry: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 11,
    color: colors.white,
  },
});
