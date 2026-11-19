import { ArrowLeft, Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PosterGrid } from '@/components/anime/poster-grid';
import { Chip } from '@/components/common/chip';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { PROVIDERS } from '@/constants/providers';
import { useDebouncedValue, useSearch } from '@/hooks/use-search';
import { useSettingsStore } from '@/stores/settings-store';
import { colors, fonts, layout } from '@/theme';
import { sanitizeSearchTerm } from '@/utils/format';

export function SearchScreen() {
  const router = useRouter();
  const defaultProvider = useSettingsStore((state) => state.provider);
  const [provider, setProvider] = useState(defaultProvider);
  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term, 450);
  const query = useSearch(debounced, provider);
  const results = query.data?.results ?? [];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const showHint = debounced.trim().length < 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.searchHeader}>
        <Pressable onPress={handleBack} hitSlop={10} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.inputContainer}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={term}
            onChangeText={(value) => setTerm(sanitizeSearchTerm(value))}
            placeholder="Buscar anime..."
            placeholderTextColor="#6F6F6F"
            style={styles.input}
            autoFocus={Platform.OS !== 'web'}
            returnKeyType="search"
            autoCorrect={false}
          />
          {term.length > 0 ? (
            <Pressable onPress={() => setTerm('')} hitSlop={8}>
              <X size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.providerStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerContent}>
          {PROVIDERS.map((candidate) => (
            <Chip
              key={candidate.id}
              label={candidate.label}
              active={provider === candidate.id}
              onPress={() => setProvider(candidate.id)}
            />
          ))}
        </ScrollView>
      </View>

      {showHint ? (
        <EmptyState
          title="Encuentra tu próximo anime"
          description="Escribe al menos 2 letras para buscar en el proveedor seleccionado. Los resultados se consultan en vivo contra la API."
        />
      ) : (
        <PosterGrid
          items={results}
          header={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {query.isFetching && !query.data
                  ? 'Buscando...'
                  : `${query.data?.count ?? 0} resultados para "${debounced.trim()}"`}
              </Text>
            </View>
          }
          empty={
            query.isError ? (
              <ErrorState
                title="No se pudo buscar"
                message={(query.error as Error)?.message ?? 'Error inesperado.'}
                onRetry={() => void query.refetch()}
              />
            ) : query.isLoading || query.isFetching ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <EmptyState
                title="Sin resultados"
                description="Prueba con otro término o cambia de proveedor."
              />
            )
          }
          footer={null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 3,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 3,
    paddingHorizontal: 12,
    height: 42,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 13,
  },
  providerStrip: {
    paddingBottom: 8,
  },
  providerContent: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
  },
  resultsHeader: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  resultsCount: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  loading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});
