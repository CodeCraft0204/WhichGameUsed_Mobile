/**
 * Vintage parchment palette — warm cream paper, umber ink, sepia borders.
 * Matches the hand-drawn advocacy / hub reference screens.
 * Prefer semantic tokens over raw hex in components.
 */
export const figmaColors = {
  // Core scale
  parchment: '#F2EBDC',
  cream: '#F7F1E4',
  creamLight: '#FBF7EF',
  stone: '#E8DFCF',
  stoneDark: '#D9CEBB',
  taupe: '#8B7355',
  taupeLight: '#B5A088',
  bronze: '#9A7B5F',
  sepia: '#4A4035',
  umber: '#3D3429',
  brown: '#5C4A3A',
  brownMuted: '#6B5E4F',
  gray: '#6B5E4F',
  grayMuted: '#7A6B5A',
  charcoal: '#3D3429',
  ink: '#3D3429',
  black: '#2A241C',
  white: '#FDF9F2',

  // Layout surfaces
  background: '#F2EBDC',
  surface: '#F7F1E4',
  surfaceElevated: '#F5EDE0',
  surfaceMuted: '#EDE4D4',
  surfaceHighlight: '#E9DFCC',
  /** Thumbnail backdrop for frame/pin PNGs — contrasts parchment art on cream pages. */
  assetPreviewBg: '#B5A696',
  assetPreviewBorder: '#9A8978',
  bottomNav: '#F2EBDC',
  bottomNavBorder: '#D4C4AE',

  // Typography
  textPrimary: '#3D3429',
  textSecondary: '#5C4F42',
  textMuted: '#7A6B5A',
  textOnDark: '#F7F1E4',
  textAccent: '#8B6F52',

  // Accent & navigation
  accent: '#8B7355',
  accentStrong: '#9A7B5F',
  navActive: '#8B6F52',
  navInactive: '#6B5E4F',
  navItemActiveBg: '#E5D9C8',

  // Borders & dividers
  border: '#8B7355',
  borderLight: '#D4C4AE',
  borderStrong: '#B8A48C',
  divider: '#E0D5C4',

  // Tabs — espresso brown active pill, cream label
  tabActiveBg: '#4A4035',
  tabActiveBorder: '#3D3429',
  tabInactiveBg: '#F2EBDC',
  tabInactiveBorder: '#8B7355',
  tabText: '#6B5E4F',
  tabTextActive: '#F7F1E4',

  // Cards & chips
  cardFeaturedBg: '#F5EDE0',
  cardFeaturedBorder: '#E0D5C4',
  cardRecentBg: '#EDE4D4',
  cardRecentBorder: '#D9CEBB',
  tagBg: '#E8DCC8',
  tagBorder: '#F2EBDC',
  metaDivider: '#D4C4AE',

  // CTA & utility rail
  ctaBackground: '#E9DFCC',
  ctaBorder: '#D4C4AE',
  utilityBar: '#E8DFCF',

  // Buttons & controls
  buttonPrimaryBg: '#4A4035',
  buttonPrimaryBorder: '#3D3429',
  buttonPrimaryText: '#F7F1E4',
  scanButtonBg: '#5C4A3A',
  progressTrack: '#D9CEBB',
  progressFill: '#9A7B5F',

  // Form inputs — warm paper, not stark white
  inputBg: '#FDF9F2',
  inputBorder: '#D4C4AE',
  inputBorderFocus: '#8B7355',

  // Feedback — muted vintage tones
  error: '#9B3A32',
  errorBg: '#FBF0EE',
  errorBorder: '#E0B4AE',
  success: '#4D6B52',
  successBg: '#F0F4EF',
  infoBg: '#FDF9F2',
  infoBorder: '#D4C4AE',

  // Camera / media chrome
  cameraChrome: '#4A4035',
  cameraControlBg: '#5C4A3A',
  overlayLight: '#FDF9F2'
} as const;

export type FigmaColorToken = keyof typeof figmaColors;
