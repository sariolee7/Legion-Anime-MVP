export const layout = {
  screenPadding: 16,
  sectionPaddingH: 16,
  sectionPaddingV: 8,
  headerPaddingH: 16,
  contentMaxWidth: 1200,
  sidebarWidth: 224,
  cardRadius: 10,
  posterAspect: 161 / 238,
  gridGap: 14,
  gridGapDesktop: 20,
  railGap: 14,
  episodeThumbWidth: 96,
  episodeThumbHeight: 58,
  posterWidthRail: 132,
  posterWidthGrid: 163,
  heroCardWidth: 430,
  heroCardHeight: 300,
  heroTitleBarHeight: 38,
  headerHeight: 64,
  navBarHeight: 76,
} as const;

export const breakpoints = {
  tablet: 768,
  desktop: 1100,
} as const;
