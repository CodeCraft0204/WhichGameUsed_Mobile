/** Scale Figma body-copy sizes for EB Garamond. */
export function bodyText(t: (n: number) => number, designSize: number) {
  return Math.round(t(designSize));
}

/** Figma: subtitles and editorial all-caps accents use Broadsheet. */
export const broadsheetAccent = {
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2
} as const;
