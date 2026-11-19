import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout } from '@/theme';

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ style }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 750,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ backgroundColor: colors.skeletonBase, opacity, borderRadius: layout.cardRadius }, style]}
    />
  );
}

export function PosterSkeleton({ width = layout.posterWidthRail }: { width?: number }) {
  return (
    <View style={{ width }}>
      <Skeleton style={{ width, aspectRatio: layout.posterAspect }} />
      <Skeleton style={{ height: 10, width: width * 0.92, marginTop: 7 }} />
      <Skeleton style={{ height: 10, width: width * 0.6, marginTop: 4 }} />
    </View>
  );
}

export function HeroSkeleton({ width }: { width: number }) {
  return (
    <View style={{ paddingHorizontal: 15 }}>
      <Skeleton style={{ width, height: Math.round(width * (layout.heroCardHeight / layout.heroCardWidth)) }} />
    </View>
  );
}

export function EpisodeRowSkeleton() {
  return (
    <View style={styles.episodeRow}>
      <Skeleton style={styles.episodeThumb} />
      <View style={styles.episodeBody}>
        <Skeleton style={{ height: 12, width: '70%' }} />
        <Skeleton style={{ height: 12, width: '45%', marginTop: 8 }} />
      </View>
      <View style={styles.episodeActions}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} style={{ width: 20, height: 20, borderRadius: 10 }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.elevated,
    borderRadius: layout.cardRadius,
    padding: 8,
    gap: 10,
    marginHorizontal: layout.screenPadding,
    marginBottom: 10,
  },
  episodeThumb: {
    width: layout.episodeThumbWidth,
    height: layout.episodeThumbHeight,
  },
  episodeBody: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
