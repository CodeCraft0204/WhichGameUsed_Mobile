import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { FIGMA_DESIGN_WIDTH } from '@/hooks/useFigmaLayout';

/** Auth screens use slightly larger scale than hub pages for hero + type legibility. */
const AUTH_LAYOUT_BOOST = 1.22;
const AUTH_TEXT_BOOST = 1.18;
const AUTH_MIN_TEXT_SCALE = 0.82;

export function useAuthLayout() {
  const { width } = useWindowDimensions();
  const layoutScale = Math.min(width / FIGMA_DESIGN_WIDTH, 1) * AUTH_LAYOUT_BOOST;
  const textScale = Math.max(AUTH_MIN_TEXT_SCALE, layoutScale) * AUTH_TEXT_BOOST;
  const s = (value: number) => Math.round(value * layoutScale);
  const t = (value: number) => Math.round(value * textScale);

  return useMemo(
    () => ({ layoutScale, textScale, s, t }),
    [layoutScale, textScale]
  );
}
