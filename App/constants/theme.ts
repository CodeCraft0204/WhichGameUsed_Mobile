export const colors = {
  pageBackground: '#F6F4F0',
  cardBackground: '#F6F4F1',
  cardMutedBackground: '#F3F0EC',
  borderSoft: '#E8E5E2',
  borderStrong: '#D8D2CC',
  ink: '#2A2E33',
  inkSoft: '#61666B',
  textPrimary: '#35393D',
  textSecondary: '#6D7074',
  textMuted: '#8C9094',
  accentBronze: '#B0927D',
  accentTaupe: '#9C8370',
  accentTab: '#292D31',
  tabInactive: '#FCF9F7',
  tabBorder: '#B3A499',
  white: '#FFFFFF'
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  }
};
