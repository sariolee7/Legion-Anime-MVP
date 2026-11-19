import { Tabs } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';

import { AppSidebar } from '@/components/navigation/app-sidebar';
import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { useResponsive } from '@/hooks/use-responsive';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { isMobile } = useResponsive();

  return (
    <View style={styles.root}>
      {!isMobile ? <AppSidebar /> : null}
      <View style={styles.content}>
        <Tabs
          tabBar={(props) => (isMobile ? <AppTabBar {...props} /> : null)}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
          }}>
          <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
          <Tabs.Screen name="listas" options={{ title: 'Listas' }} />
          <Tabs.Screen name="directorio" options={{ title: 'Directorio' }} />
          <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
