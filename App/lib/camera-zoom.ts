/**
 * Standard optical zoom stops (same labels as iOS Camera / Google Camera).
 * Values map to expo-camera `zoom` prop: 0 = minimum (widest), 1 = device max.
 */
export const CAMERA_ZOOM_STOPS = [0.5, 1, 2, 3, 5] as const;

export type CameraZoomStop = (typeof CAMERA_ZOOM_STOPS)[number];

const DEFAULT_STOP_INDEX = CAMERA_ZOOM_STOPS.indexOf(1);

/** Maps a labeled zoom stop to normalized camera zoom (0–1). */
export function zoomStopToNormalized(stop: CameraZoomStop): number {
  if (stop <= 0.5) return 0;
  if (stop <= 1) return 0;
  const maxOpticalRatio = 10;
  return Math.min(1, Math.log2(stop) / Math.log2(maxOpticalRatio));
}

export function formatZoomLabel(stop: CameraZoomStop): string {
  return stop === 0.5 ? '.5x' : `${stop}x`;
}

export function nextZoomStopIndex(currentIndex: number): number {
  return (currentIndex + 1) % CAMERA_ZOOM_STOPS.length;
}

export function defaultZoomStopIndex(): number {
  return DEFAULT_STOP_INDEX >= 0 ? DEFAULT_STOP_INDEX : 1;
}
