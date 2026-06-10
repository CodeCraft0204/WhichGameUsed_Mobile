import { figmaColors } from '@/constants/figmaColors';

/** Legacy page-template tokens — vintage parchment palette via figmaColors. */
export const colors = {
  pageBackground: figmaColors.background,
  cardBackground: figmaColors.surfaceElevated,
  cardMutedBackground: figmaColors.surfaceMuted,
  borderSoft: figmaColors.divider,
  borderStrong: figmaColors.borderLight,
  ink: figmaColors.ink,
  inkSoft: figmaColors.gray,
  textPrimary: figmaColors.textPrimary,
  textSecondary: figmaColors.textSecondary,
  textMuted: figmaColors.textMuted,
  accentBronze: figmaColors.bronze,
  accentTaupe: figmaColors.taupe,
  accentTab: figmaColors.tabActiveBg,
  tabInactive: figmaColors.tabInactiveBg,
  tabBorder: figmaColors.tabInactiveBorder,
  white: figmaColors.white,
  utilityRail: figmaColors.utilityBar,
  utilityButton: figmaColors.surface,
  bottomNav: figmaColors.bottomNav,
  signButtonBorder: figmaColors.scanButtonBg,
  signButtonText: figmaColors.textOnDark,
  inputPlaceholder: figmaColors.textMuted
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  pageHorizontal: 20,
  pageTop: 16,
  cardGap: 12
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999
} as const;

export const font = {
  display: 42,
  sectionDisplay: 24,
  subtitle: 20,
  body: 16,
  bodySmall: 14,
  label: 13,
  button: 15,
  metric: 36
} as const;

export const lineHeight = {
  tight: 20,
  normal: 24,
  relaxed: 28,
  display: 44
} as const;

export const shadow = {
  card: {
    shadowColor: figmaColors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3
  }
} as const;
