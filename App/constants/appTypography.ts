/** Slight compensation — Broadsheet metrics vs legacy body fonts. */
export const BODY_TEXT_SCALE = 1.0;

/** Scale Figma body-copy sizes for Broadsheet Regular. */
export function bodyText(t: (n: number) => number, designSize: number) {
  return Math.round(t(designSize) * BODY_TEXT_SCALE);
}

/** Figma: subtitles and editorial all-caps accents use Broadsheet. */
export const broadsheetAccent = {
  textTransform: 'uppercase' as const,
  letterSpacing: 1.2
} as const;
