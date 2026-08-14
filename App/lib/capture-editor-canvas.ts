import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Export the photo-editor canvas to a JPEG URI (iOS / Android).
 * Web uses `capture-editor-canvas.web.ts` so html2canvas stays out of native bundles.
 */
export async function captureEditorCanvas(ref: RefObject<View | null>): Promise<string> {
  const node = ref.current;
  if (!node) throw new Error('Canvas not ready.');

  return captureRef(ref, { format: 'jpg', quality: 0.92 });
}
