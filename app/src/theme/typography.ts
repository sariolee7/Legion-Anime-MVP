import { colors } from './colors';

export const fonts = {
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  display: 'Calistoga_400Regular',
  ui: 'Poppins_400Regular',
  uiMedium: 'Poppins_500Medium',
  uiSemiBold: 'Poppins_600SemiBold',
  uiBold: 'Poppins_700Bold',
} as const;

export const typography = {
  screenTitle: {
    fontFamily: fonts.mono,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  heroTitle: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  bodyMedium: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  bodyStrong: {
    fontFamily: fonts.uiSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.ui,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
  navLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 17,
  },
  monoValue: {
    fontFamily: fonts.mono,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  monoSmall: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
} as const;
