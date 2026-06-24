import { Platform, type View } from 'react-native';
import type { RefObject } from 'react';
import { captureRef } from 'react-native-view-shot';
import { figmaColors } from '@/constants/figmaColors';

/**
 * Export the photo-editor canvas to a JPEG data/blob URI.
 * react-native-view-shot uses findNodeHandle, which React Native Web does not support.
 */
export async function captureEditorCanvas(ref: RefObject<View | null>): Promise<string> {
  const node = ref.current;
  if (!node) throw new Error('Canvas not ready.');

  if (Platform.OS === 'web') {
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

  return captureRef(ref, { format: 'jpg', quality: 0.92 });
}
