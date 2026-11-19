export const layout = {
  screenPadding: 15,
  sectionPaddingH: 18,
  sectionPaddingV: 7,
  headerPaddingH: 25,
  contentMaxWidth: 1200,
  sidebarWidth: 224,
  cardRadius: 3,
  posterAspect: 161 / 238,
  gridGap: 14,
  gridGapDesktop: 20,
  railGap: 14,
  episodeThumbSize: 121,
  posterWidthRail: 134,
  posterWidthGrid: 163,
  heroCardWidth: 430,
  heroCardHeight: 300,
  heroTitleBarHeight: 35,
  navBarHeight: 82,
} as const;

export const breakpoints = {
  tablet: 768,
  desktop: 1100,
} as const;
