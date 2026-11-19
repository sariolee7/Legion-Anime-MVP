export const colors = {
  background: '#131313',
  playerBackground: '#121212',
  surface: '#1B1B1B',
  elevated: '#262626',
  titleBar: '#000000',
  border: '#2E2E2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#EDEDED',
  textMuted: '#A9A9A9',
  iconMuted: '#BABABA',
  placeholder: '#2A2A2A',
  skeletonBase: '#1F1F1F',
  skeletonHighlight: '#2C2C2C',
  overlaySoft: 'rgba(0, 0, 0, 0.45)',
  overlayStrong: 'rgba(0, 0, 0, 0.85)',
  error: '#F26D6D',
  success: '#7BD88F',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type AppColors = typeof colors;
