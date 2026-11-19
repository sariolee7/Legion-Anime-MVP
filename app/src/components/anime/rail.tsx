import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { layout } from '@/theme';

interface RailProps {
  children: ReactNode;
  gap?: number;
  paddingHorizontal?: number;
}

export function Rail({ children, gap = layout.railGap, paddingHorizontal = 15 }: RailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { gap, paddingHorizontal }]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
});
