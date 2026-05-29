import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export const FIGMA_DESIGN_WIDTH = 810;

export function useFigmaLayout(maxScale = 0.65) {
  const { width } = useWindowDimensions();
  const layoutScale = Math.min(width / FIGMA_DESIGN_WIDTH, maxScale);
  const textScale = Math.max(0.7, layoutScale);
  const s = (value: number) => Math.round(value * layoutScale);
  const t = (value: number) => Math.round(value * textScale);

  return useMemo(
    () => ({ layoutScale, textScale, s, t }),
    [layoutScale, textScale]
  );
}
