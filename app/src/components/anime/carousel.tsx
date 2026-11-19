import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';

import { SectionHeader } from '@/components/anime/section-header';
import { GenreCard } from '@/components/anime/genre-card';
import { PosterCard } from '@/components/anime/poster-card';
import { TypeCard } from '@/components/anime/type-card';
import { AppImage } from '@/components/common/app-image';
import { ErrorState } from '@/components/common/error-state';
import { PosterSkeleton, Skeleton } from '@/components/common/skeleton';
import { TruncatedTitle } from '@/components/common/truncated-title';
import { useResponsive } from '@/hooks/use-responsive';
import { colors, layout, typography } from '@/theme';
import type { AnimeListItem } from '@/types/anime';

export type CarouselCardType = 'hero' | 'portada' | 'genero' | 'tipo';

export interface CarouselItem {
  key: string;
  title: string;
  image?: string | null;
  slug?: string;
  progress?: number;
}

interface CarouselProps {
  title: string;
  items: CarouselItem[];
  cardType: CarouselCardType;
  onItemPress: (item: CarouselItem) => void;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  loadingCount?: number;
  errorMessage?: string;
  onRetry?: () => void;
  hideWhenEmpty?: boolean;
  emptyMessage?: string;
}

type WebScrollNode = HTMLElement;

const AUTOPLAY_MS = 5000;

function getScrollNode(ref: RefObject<ScrollViewInstance | null>): WebScrollNode | null {
  if (Platform.OS !== 'web') {
    return null;
  }
  const current = ref.current as unknown as { getScrollableNode?: () => WebScrollNode } | null;
  return current?.getScrollableNode?.() ?? null;
}

function toAnimeListItem(item: CarouselItem): AnimeListItem {
  return {
    id: null,
    title: item.title,
    slug: item.slug ?? null,
    url: item.key,
    image: item.image ?? null,
    backdrop: null,
    type: null,
    score: null,
    status: null,
    year: null,
  };
}

export function Carousel({
  title,
  items,
  cardType,
  onItemPress,
  actionLabel,
  onAction,
  loading = false,
  loadingCount = 4,
  errorMessage,
  onRetry,
  hideWhenEmpty = true,
  emptyMessage,
}: CarouselProps) {
  const { width, isMobile } = useResponsive();
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const suppressClickRef = useRef(false);
  const activeIndexRef = useRef(0);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = useMemo(() => {
    if (cardType === 'hero') {
      return Math.min(layout.heroCardWidth, width - layout.screenPadding * 2 - 40);
    }
    return layout.posterWidthRail;
  }, [cardType, width]);

  const gap = cardType === 'hero' ? 12 : layout.railGap;
  const step = cardWidth + gap;
  const heroHeight = Math.round(cardWidth * (layout.heroCardHeight / layout.heroCardWidth));
  const showArrows = !isMobile && (hovered || focused);
  const autoplayPaused = hovered || touching || dragging;

  const webTrackProps = Platform.OS === 'web'
    ? { dataSet: { carousel: 'track', reducedMotion: String(reduceMotion) } }
    : {};
  const webItemProps = Platform.OS === 'web' ? { dataSet: { carousel: 'item' } } : {};

  const updateBounds = useCallback((scrollLeft?: number) => {
    const node = getScrollNode(scrollRef);
    if (!node) {
      return;
    }
    const x = scrollLeft ?? node.scrollLeft;
    const max = Math.max(0, node.scrollWidth - node.clientWidth);
    setCanPrev(x > 4);
    setCanNext(x < max - 24);
  }, []);

  const scrollToX = useCallback(
    (x: number, smooth = true) => {
      const target = Math.max(0, x);
      const animate = smooth && !reduceMotion;
      scrollRef.current?.scrollTo({ x: target, animated: animate });
    },
    [reduceMotion]
  );

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
      scrollToX(clamped * step);
    },
    [items.length, scrollToX, step]
  );

  const scrollByBlock = useCallback(
    (direction: -1 | 1) => {
      const node = getScrollNode(scrollRef);
      if (node) {
        const amount =
          cardType === 'hero'
            ? step
            : Math.max(step, Math.floor(node.clientWidth / step) * step);
        scrollToX(node.scrollLeft + direction * amount);
        return;
      }
      scrollToX(direction * step * 2);
    },
    [cardType, scrollToX, step]
  );

  const handlePress = useCallback(
    (item: CarouselItem) => {
      if (suppressClickRef.current) {
        return;
      }
      onItemPress(item);
    },
    [onItemPress]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      updateBounds(x);
      if (cardType === 'hero' && step > 0) {
        const index = Math.round(x / step);
        if (index !== activeIndexRef.current) {
          activeIndexRef.current = index;
          setActiveIndex(index);
        }
      }
    },
    [cardType, step, updateBounds]
  );

  // Detecta la preferencia de movimiento reducido.
  useEffect(() => {
    if (Platform.OS === 'web') {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => setReduceMotion(media.matches);
      sync();
      media.addEventListener('change', sync);
      return () => media.removeEventListener('change', sync);
    }

    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  // Recalcula los límites al cambiar tamaño, datos o resolución.
  useEffect(() => {
    const frame = requestAnimationFrame(() => updateBounds());
    return () => cancelAnimationFrame(frame);
  }, [cardWidth, items.length, updateBounds, width]);

  // Autoplay del hero: pausa al interactuar, sin movimiento si el usuario lo pide.
  useEffect(() => {
    if (cardType !== 'hero' || reduceMotion || autoplayPaused || items.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      const node = getScrollNode(scrollRef);
      const max = node ? Math.max(0, node.scrollWidth - node.clientWidth) : Number.POSITIVE_INFINITY;
      let next = (activeIndexRef.current + 1) % items.length;
      if (next * step > max + 24) {
        next = 0;
      }
      activeIndexRef.current = next;
      setActiveIndex(next);
      scrollToX(next * step);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplayPaused, cardType, items.length, reduceMotion, scrollToX, step]);

  // Web: rueda con Shift, arrastre de ratón y atajos de teclado.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const node = getScrollNode(scrollRef);
    if (!node) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (!event.shiftKey) {
        return;
      }
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };

    let startX = 0;
    let startLeft = 0;
    let moved = false;
    let active = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) {
        return;
      }
      active = true;
      moved = false;
      startX = event.clientX;
      startLeft = node.scrollLeft;
      node.style.cursor = 'grabbing';
      node.style.userSelect = 'none';
      setDragging(true);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!active) {
        return;
      }
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 5 && !moved) {
        moved = true;
        suppressClickRef.current = true;
      }
      node.scrollLeft = startLeft - delta;
    };

    const onPointerUp = () => {
      if (!active) {
        return;
      }
      active = false;
      node.style.cursor = '';
      node.style.userSelect = '';
      setDragging(false);
      if (moved) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
    };

    node.addEventListener('wheel', onWheel, { passive: false });
    node.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    return () => {
      node.removeEventListener('wheel', onWheel);
      node.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [cardWidth, items.length]);

  const handleKeyDown = (event: { nativeEvent: { key: string }; preventDefault?: () => void }) => {
    if (event.nativeEvent.key === 'ArrowLeft') {
      event.preventDefault?.();
      scrollByBlock(-1);
    } else if (event.nativeEvent.key === 'ArrowRight') {
      event.preventDefault?.();
      scrollByBlock(1);
    }
  };

  if (loading) {
    return (
      <View role="region" aria-label={title} style={styles.section}>
        <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
        {cardType === 'hero' ? (
          <View style={styles.heroSkeletonWrap}>
            <Skeleton style={{ width: cardWidth, height: heroHeight }} />
          </View>
        ) : (
          <View style={styles.skeletonRow}>
            {Array.from({ length: loadingCount }).map((_, index) => (
              <PosterSkeleton key={index} width={cardWidth} />
            ))}
          </View>
        )}
      </View>
    );
  }

  if (errorMessage && items.length === 0) {
    return (
      <View role="region" aria-label={title} style={styles.section}>
        <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
        <ErrorState compact message={errorMessage} onRetry={onRetry} />
      </View>
    );
  }

  if (items.length === 0) {
    if (hideWhenEmpty) {
      return null;
    }
    return (
      <View role="region" aria-label={title} style={styles.section}>
        <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
        <Text style={styles.empty}>{emptyMessage ?? 'Sin contenido por ahora.'}</Text>
      </View>
    );
  }

  return (
    <View
      role="region"
      aria-label={title}
      style={styles.section}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => {
        setTouching(false);
        setHovered(false);
      }}
      tabIndex={0}
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />

      {errorMessage ? (
        <ErrorState compact message={errorMessage} onRetry={onRetry} />
      ) : null}

      <View style={styles.trackWrap}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={step}
          snapToAlignment="start"
          disableIntervalMomentum
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={() => setDragging(true)}
          onScrollEndDrag={() => setDragging(false)}
          onMomentumScrollEnd={() => setDragging(false)}
          style={styles.track}
          contentContainerStyle={[styles.trackContent, { gap }]}
          {...webTrackProps}>
          {items.map((item) => (
            <View key={item.key} style={{ width: cardWidth }} {...webItemProps}>
              {cardType === 'hero' ? (
                <HeroCard
                  item={item}
                  width={cardWidth}
                  height={heroHeight}
                  onPress={() => handlePress(item)}
                />
              ) : cardType === 'genero' ? (
                <GenreCard
                  label={item.title}
                  slug={item.slug ?? item.key}
                  image={item.image}
                  width={cardWidth}
                  onPress={() => handlePress(item)}
                />
              ) : cardType === 'tipo' ? (
                <TypeCard label={item.title} width={cardWidth} onPress={() => handlePress(item)} />
              ) : (
                <PosterCard
                  item={toAnimeListItem(item)}
                  width={cardWidth}
                  progress={item.progress}
                  onPress={() => handlePress(item)}
                />
              )}
            </View>
          ))}
        </ScrollView>

        {showArrows ? (
          <>
            <View style={[styles.arrowSlot, styles.arrowLeft]} pointerEvents="box-none">
              <ArrowButton
                direction="prev"
                disabled={!canPrev}
                onPress={() => scrollByBlock(-1)}
              />
            </View>
            <View style={[styles.arrowSlot, styles.arrowRight]} pointerEvents="box-none">
              <ArrowButton
                direction="next"
                disabled={!canNext}
                onPress={() => scrollByBlock(1)}
              />
            </View>
          </>
        ) : null}
      </View>

      {cardType === 'hero' && items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <Pressable
                key={item.key}
                onPress={() => goToIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={`Ir al slide ${index + 1} de ${items.length}`}
                accessibilityState={active ? { selected: true } : {}}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.dot,
                  active && styles.dotActive,
                  pressed && { opacity: 0.7 },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

interface HeroCardProps {
  item: CarouselItem;
  width: number;
  height: number;
  onPress: () => void;
}

function HeroCard({ item, width, height, onPress }: HeroCardProps) {
  const webCardProps = Platform.OS === 'web' ? { dataSet: { carousel: 'card' } } : {};

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${item.title}`}
      style={(state) => [
        styles.heroCard,
        { width, height },
        (state as { hovered?: boolean }).hovered && styles.cardHover,
        state.pressed && { opacity: 0.9 },
      ]}
      {...webCardProps}>
      <AppImage
        uri={item.image}
        lazy={false}
        brandedFallback
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroTitleBar}>
        <TruncatedTitle text={item.title} numberOfLines={1} style={typography.heroTitle} />
      </View>
    </Pressable>
  );
}

interface ArrowButtonProps {
  direction: 'prev' | 'next';
  disabled: boolean;
  onPress: () => void;
}

function ArrowButton({ direction, disabled, onPress }: ArrowButtonProps) {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={direction === 'prev' ? 'Anterior' : 'Siguiente'}
      accessibilityState={{ disabled }}
      aria-disabled={disabled}
      style={(state) => [
        styles.arrow,
        disabled && styles.arrowDisabled,
        (state as { hovered?: boolean }).hovered && !disabled && styles.arrowHover,
        (state as { focused?: boolean }).focused && styles.arrowFocused,
      ]}>
      <Icon size={18} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  trackWrap: {
    position: 'relative',
  },
  track: {
    width: '100%',
  },
  trackContent: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  heroSkeletonWrap: {
    paddingHorizontal: layout.screenPadding,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: layout.railGap,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  empty: {
    ...typography.caption,
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 12,
  },
  heroCard: {
    borderRadius: layout.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.placeholder,
    justifyContent: 'flex-end',
  },
  heroTitleBar: {
    minHeight: layout.heroTitleBarHeight,
    backgroundColor: colors.titleBar,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardHover: {
    transform: [{ scale: 1.02 }],
    zIndex: 2,
  },
  arrowSlot: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  arrowLeft: {
    left: 6,
  },
  arrowRight: {
    right: 6,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  arrowHover: {
    backgroundColor: 'rgba(10, 10, 10, 0.92)',
    borderColor: colors.white,
  },
  arrowFocused: {
    borderColor: colors.white,
    borderWidth: 2,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.white,
  },
});
