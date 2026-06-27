export type FramePhotoTransform = {
  /** Zoom relative to cover-fit baseline. */
  scale: number;
  /** Clockwise degrees inside the frame window. */
  rotation: number;
  /** Horizontal pan — % of clip width. */
  offsetX: number;
  /** Vertical pan — % of clip height. */
  offsetY: number;
};

export const DEFAULT_FRAME_PHOTO_TRANSFORM: FramePhotoTransform = {
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0
};

export const MIN_FRAME_PHOTO_SCALE = 0.5;
export const MAX_FRAME_PHOTO_SCALE = 4;

export function clampFramePhotoScale(value: number): number {
  return Math.min(MAX_FRAME_PHOTO_SCALE, Math.max(MIN_FRAME_PHOTO_SCALE, value));
}

export function clampFramePhotoOffset(value: number, scale: number): number {
  const limit = 35 + (scale - 1) * 22;
  return Math.min(limit, Math.max(-limit, value));
}

/** Position a handle at the outer frame corner from inside the photo clip box. */
export function frameEdgeOffset(insetStart: number, insetEnd: number): number {
  const inner = 100 - insetStart - insetEnd;
  if (inner <= 0) return -8;
  return -(insetStart / inner) * 100;
}

export type FrameInsetPercents = {
  top: number;
  left: number;
  right: number;
  bottom: number;
};

export function frameTopLeftHandlePosition(insets: FrameInsetPercents): {
  top: `${number}%`;
  left: `${number}%`;
} {
  return {
    top: `${frameEdgeOffset(insets.top, insets.bottom)}%`,
    left: `${frameEdgeOffset(insets.left, insets.right)}%`
  };
}
