import type { RefObject } from 'react';
import type { View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

/**
 * Export the photo-editor canvas to a JPEG data URI (web only).
 */
export async function captureEditorCanvas(ref: RefObject<View | null>): Promise<string> {
  const node = ref.current;
  if (!node) throw new Error('Canvas not ready.');

  const element = node as unknown as HTMLElement;
  const { default: html2canvas } = await import('html2canvas');
  const scale = typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 2 : 1;
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    backgroundColor: figmaColors.parchment,
    scale
  });
  return canvas.toDataURL('image/jpeg', 0.92);
}
