import Constants from 'expo-constants';
import { ExternalLink } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubpageHeader } from '@/components/common/subpage-header';
import { colors, fonts, layout } from '@/theme';

function InfoPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <SubpageHeader title={title} subtitle={subtitle} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </View>
  );
}

export function TermsScreen() {
  return (
    <InfoPage title="Términos de Servicio" subtitle="MVP educativo · Legión Anime">
      <Card
        title="Uso del servicio"
        body="Legión Anime es un proyecto MVP con fines académicos y de demostración. La aplicación no aloja contenido audiovisual: los metadatos y enlaces son provistos por la API open source anime1v-api, que opera sobre sitios de terceros."
      />
      <Card
        title="Contenido de terceros"
        body="Los derechos de los animes, portadas y videos pertenecen a sus respectivos titulares. El uso de los enlaces está sujeto a los términos de cada proveedor. Si eres titular de derechos y deseas reportar contenido, contacta al mantenedor de anime1v-api."
      />
      <Card
        title="Datos locales"
        body="Favoritos, listas, historial y progreso de reproducción se guardan únicamente en tu dispositivo (AsyncStorage). No se envían a servidores propios ni se comparten con terceros."
      />
      <Card
        title="Sin garantías"
        body="El servicio se ofrece tal cual, sin garantías de disponibilidad. Los enlaces de streaming pueden expirar o fallar por causas ajenas a la aplicación."
      />
    </InfoPage>
  );
}

export function HelpScreen() {
  return (
    <InfoPage title="Plataforma de ayuda" subtitle="Preguntas frecuentes y soporte">
      <Card
        title="1. ¿La app no carga datos?"
        body="Verifica que el servidor anime1v-api esté corriendo (npm run dev en la carpeta server/) y que la URL configurada en Perfil → Configuración sea accesible desde tu dispositivo. En Android físico usa la IP LAN de tu PC; en el emulador usa http://10.0.2.2:3001."
      />
      <Card
        title="2. ¿Un episodio no reproduce?"
        body="El reproductor intenta resolver hasta 4 servidores reales. Algunos servidores caducan sus enlaces o bloquean accesos automatizados. Usa Reintentar o prueba otro episodio/servidor."
      />
      <Card
        title="3. ¿Se guarda mi progreso?"
        body="Sí. El progreso se guarda cada pocos segundos en tu dispositivo y alimenta las secciones Continuar Viendo e Historial."
      />
      <Card
        title="4. ¿Cómo reporto un problema?"
        body="Abre un issue en el repositorio de la API (github.com/FxxMorgan/anime1v-api/issues) si el problema es del backend, o revisa la documentación del proyecto para problemas de la app."
      />
      <Pressable
        onPress={() => void Linking.openURL('https://github.com/FxxMorgan/anime1v-api')}
        style={styles.linkButton}>
        <Text style={styles.linkText}>Abrir repositorio de anime1v-api</Text>
        <ExternalLink size={14} color={colors.textPrimary} />
      </Pressable>
    </InfoPage>
  );
}

export function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <InfoPage title="Acerca de" subtitle={`Legión Anime v${version}`}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandKicker}>LEGIÓN</Text>
        <Text style={styles.brandName}>ANIME</Text>
        <Text style={styles.brandTag}>MVP de streaming y descubrimiento</Text>
      </View>
      <Card
        title="La aplicación"
        body="App multiplataforma (Android y Web) construida con React Native, Expo, Expo Router, TypeScript, TanStack Query, Zustand y AsyncStorage. El diseño está basado en el archivo de Figma del proyecto."
      />
      <Card
        title="Fuente de datos y streaming"
        body="anime1v-api, creada y mantenida por FxxMorgan (github.com/FxxMorgan), licencia MIT. El motor de scraping y resolución de streams imprime sus créditos en headers y consola; esta app conserva dichos créditos."
      />
      <Card
        title="Versión"
        body={`Versión instalada: v${version}. Para compilar un APK usa el perfil "preview" de EAS Build (ver README del proyecto).`}
      />
      <Pressable
        onPress={() => void Linking.openURL('https://github.com/FxxMorgan/anime1v-api')}
        style={styles.linkButton}>
        <Text style={styles.linkText}>GitHub de anime1v-api</Text>
        <ExternalLink size={14} color={colors.textPrimary} />
      </Pressable>
    </InfoPage>
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
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    marginHorizontal: layout.screenPadding,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cardBody: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: layout.screenPadding,
    height: 44,
    borderRadius: layout.cardRadius,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  brandBlock: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 4,
  },
  brandKicker: {
    fontFamily: fonts.mono,
    fontSize: 13,
    letterSpacing: 10,
    color: colors.textMuted,
  },
  brandName: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.textPrimary,
    lineHeight: 50,
  },
  brandTag: {
    fontFamily: fonts.ui,
    fontSize: 11,
    color: colors.textMuted,
  },
});
