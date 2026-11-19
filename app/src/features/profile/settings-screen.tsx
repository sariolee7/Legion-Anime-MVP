import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/anime/section-header';
import { Chip } from '@/components/common/chip';
import { SubpageHeader } from '@/components/common/subpage-header';
import { PROVIDERS } from '@/constants/providers';
import { setApiOverrides as applyApiOverrides, getConfiguredSources } from '@/services/api/config';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout } from '@/theme';

export function SettingsScreen() {
  const queryClient = useQueryClient();

  const displayName = useSettingsStore((state) => state.displayName);
  const provider = useSettingsStore((state) => state.provider);
  const variant = useSettingsStore((state) => state.variant);
  const autoplayNext = useSettingsStore((state) => state.autoplayNext);
  const apiUrlOverride = useSettingsStore((state) => state.apiUrlOverride);
  const apiKeyOverride = useSettingsStore((state) => state.apiKeyOverride);

  const setDisplayName = useSettingsStore((state) => state.setDisplayName);
  const setProvider = useSettingsStore((state) => state.setProvider);
  const setVariant = useSettingsStore((state) => state.setVariant);
  const setAutoplayNext = useSettingsStore((state) => state.setAutoplayNext);
  const setStoreApiOverrides = useSettingsStore((state) => state.setApiOverrides);

  const configured = getConfiguredSources();
  const [name, setName] = useState(displayName);
  const [apiUrl, setApiUrl] = useState(apiUrlOverride || configured.apiUrl);
  const [apiKey, setApiKey] = useState(apiKeyOverride);
  const [feedback, setFeedback] = useState('');

  const applyProfile = () => {
    setDisplayName(name);
    setFeedback('Perfil actualizado.');
  };

  const applyConnection = () => {
    setStoreApiOverrides(apiUrl, apiKey);
    applyApiOverrides({ apiUrl, apiKey });
    void queryClient.invalidateQueries();
    setFeedback('Conexión actualizada. Las consultas se recargarán con la nueva configuración.');
  };

  const resetConnection = () => {
    setStoreApiOverrides('', '');
    applyApiOverrides({ apiUrl: '', apiKey: '' });
    const fresh = getConfiguredSources();
    setApiUrl(fresh.apiUrl);
    setApiKey('');
    void queryClient.invalidateQueries();
    setFeedback('Se restauró la configuración por defecto (variables de entorno o valores locales).');
  };

  const clearCache = () => {
    queryClient.clear();
    setFeedback('Caché de consultas eliminada. La próxima navegación volverá a consultar la API.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SubpageHeader title="Configuración" subtitle="Preferencias locales del MVP" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SectionHeader title="Perfil" />
        <View style={styles.card}>
          <Text style={styles.label}>Nombre visible</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor="#6F6F6F"
            style={styles.input}
            maxLength={40}
          />
          <Pressable onPress={applyProfile} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Guardar perfil</Text>
          </Pressable>
        </View>

        <SectionHeader title="Catálogo" />
        <View style={styles.card}>
          <Text style={styles.label}>Proveedor por defecto</Text>
          <View style={styles.chipsRow}>
            {PROVIDERS.map((candidate) => (
              <Chip
                key={candidate.id}
                label={candidate.label}
                active={provider === candidate.id}
                onPress={() => {
                  setProvider(candidate.id);
                  setFeedback(`Proveedor cambiado a ${candidate.label}.`);
                }}
              />
            ))}
          </View>
          <Text style={styles.hint}>
            Algunos proveedores pueden no soportar catálogo; el servidor hará fallback automático a AnimeAV1.
          </Text>
        </View>

        <SectionHeader title="Reproducción" />
        <View style={styles.card}>
          <Text style={styles.label}>Idioma preferido</Text>
          <View style={styles.chipsRow}>
            <Chip label="SUB" active={variant === 'SUB'} onPress={() => setVariant('SUB')} />
            <Chip label="DUB" active={variant === 'DUB'} onPress={() => setVariant('DUB')} />
          </View>
          <View style={styles.switchRow}>
            <View style={styles.switchTextBlock}>
              <Text style={styles.label}>Reproducir siguiente episodio</Text>
              <Text style={styles.hint}>Continúa automáticamente al terminar el episodio actual.</Text>
            </View>
            <Switch
              value={autoplayNext}
              onValueChange={setAutoplayNext}
              trackColor={{ false: colors.border, true: colors.textMuted }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <SectionHeader title="Conexión con la API" />
        <View style={styles.card}>
          <Text style={styles.label}>URL del servidor anime1v-api</Text>
          <TextInput
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://192.168.0.10:3001"
            placeholderTextColor="#6F6F6F"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.label}>API Key</Text>
          <TextInput
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Usar la configurada en el servidor (dev-anime1v-key)"
            placeholderTextColor="#6F6F6F"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Text style={styles.hint}>
            En un dispositivo Android físico usa la IP LAN de tu PC (ej. http://192.168.0.10:3001). En el emulador de
            Android funciona 10.0.2.2:3001. En web, http://localhost:3001.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable onPress={applyConnection} style={[styles.primaryButton, styles.flexButton]}>
              <Text style={styles.primaryButtonText}>Aplicar conexión</Text>
            </Pressable>
            <Pressable onPress={resetConnection} style={[styles.secondaryButton, styles.flexButton]}>
              <Text style={styles.secondaryButtonText}>Restablecer</Text>
            </Pressable>
          </View>
        </View>

        <SectionHeader title="Datos" />
        <View style={styles.card}>
          <Text style={styles.hint}>
            Elimina la caché de consultas de TanStack Query. Tus listas, favoritos e historial se conservan.
          </Text>
          <Pressable onPress={clearCache} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Limpiar caché de consultas</Text>
          </Pressable>
        </View>

        {feedback ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingBottom: 48,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.screenPadding,
    padding: 16,
    gap: 10,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    height: 42,
    paddingHorizontal: 12,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hint: {
    fontFamily: fonts.ui,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 4,
  },
  switchTextBlock: {
    flex: 1,
    gap: 4,
  },
  primaryButton: {
    backgroundColor: colors.white,
    borderRadius: layout.cardRadius,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    color: colors.black,
  },
  secondaryButton: {
    backgroundColor: colors.elevated,
    borderRadius: layout.cardRadius,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  feedbackBox: {
    marginHorizontal: layout.screenPadding,
    marginTop: 16,
    backgroundColor: colors.elevated,
    borderRadius: layout.cardRadius,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackText: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
});
