import { figmaColors } from '@/constants/figmaColors';

/** Bottom nav tokens — Advocacy page is the reference. */
export const figmaNavTheme = {
  barBackground: figmaColors.bottomNav,
  barBorder: figmaColors.bottomNavBorder,
  itemActiveBackground: figmaColors.navItemActiveBg,
  label: figmaColors.charcoal,
  iconInactive: figmaColors.charcoal,
  iconActive: figmaColors.taupe,
  /** Design width 810: icon 60×60, label Inter Bold 11 / 13 line-height */
  iconSize: 60,
  labelFontSize: 11,
  labelLineHeight: 13,
  barMinHeight: 120,
  itemRadius: 10,
  itemGap: 5,
  barPaddingTop: 8,
  barPaddingBottom: 4,
  barPaddingHorizontal: 4
} as const;
