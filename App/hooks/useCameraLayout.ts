import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cameraLayout } from '@/constants/cameraContent';

/** Reference device where the camera UI was tuned (logical px). */
export const CAMERA_REF_WIDTH = 430;
export const CAMERA_REF_HEIGHT = 932;

const FRAME_ASPECT = cameraLayout.frameWidth / cameraLayout.frameHeight;
const LOGO_ASPECT = cameraLayout.logoHeight / cameraLayout.logoWidth;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export type CameraLayoutMetrics = {
  scale: number;
  s: (value: number) => number;
  t: (value: number) => number;
  headerPadH: number;
  headerIcon: number;
  headerMinH: number;
  headerPadV: number;
  logoW: number;
  logoH: number;
  footerH: number;
  footerPadH: number;
  footerPadV: number;
  previewPadH: number;
  frameWidth: number;
  frameHeight: number;
  gallerySize: number;
  galleryGap: number;
  modeToggleH: number;
  modeBottom: number;
  toggleWidth: number;
  captureSize: number;
  zoomSize: number;
  searchSize: number;
  galleryLeft: number;
  galleryTop: number;
};

export function useCameraLayout(): CameraLayoutMetrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const scale = width / CAMERA_REF_WIDTH;
    const s = (value: number) => Math.round(value * scale);
    const t = (value: number) => Math.round(clamp(value * scale, value * 0.8, value * 1.1));

    const headerPadH = width * 0.047;
    const headerIcon = clamp(width * 0.084, 30, 46);
    const headerPadV = clamp(height * 0.022, 14, 22);
    const headerMinH = clamp(height * 0.1, 72, 100);
    const logoW = clamp(width * 0.66, 210, 296);
    const logoH = logoW * LOGO_ASPECT;

    const footerPadV = clamp(height * 0.02, 12, 20);
    const footerH = clamp(height * 0.138, 104, 136);
    const footerPadH = width * 0.093;
    const previewPadH = width * 0.047;

    const headerBlock = headerMinH + headerPadV * 2;
    const previewHeight =
      height - insets.top - insets.bottom - headerBlock - footerH;

    const modeToggleH = clamp(width * 0.018, 48, 68);
    const modeBottom = clamp(height * 0.018, 10, 20);
    const gallerySize = clamp(width * 0.149, 46, 68);
    const galleryGap = width * 0.023;

    const sideMargin = width * 0.04;
    const maxFrameW = width - sideMargin * 2;
    const maxFrameH = previewHeight - modeToggleH - modeBottom - height * 0.022;

    let frameWidth = maxFrameW * 0.96;
    let frameHeight = frameWidth / FRAME_ASPECT;
    if (frameHeight > maxFrameH * 0.94) {
      frameHeight = maxFrameH * 0.94;
      frameWidth = frameHeight * FRAME_ASPECT;
    }

    const refMaxFrameW =
      (CAMERA_REF_WIDTH -
        CAMERA_REF_WIDTH * 0.047 * 2 -
        CAMERA_REF_WIDTH * 0.149 -
        CAMERA_REF_WIDTH * 0.023) *
      0.96;
    const largeScreenCap = refMaxFrameW * clamp(width / CAMERA_REF_WIDTH, 1, 1.12);
    if (frameWidth > largeScreenCap) {
      frameWidth = largeScreenCap;
      frameHeight = frameWidth / FRAME_ASPECT;
    }

    const captureSize = clamp(width * 0.223, 70, 96);
    const zoomSize = clamp(width * 0.13, 42, 58);
    const searchSize = clamp(width * 0.102, 34, 48);
    const toggleWidth = clamp(frameWidth * 0.9, width * 0.7, 400);

    const frameLeft = (width - frameWidth) / 2;
    const galleryLeft = Math.max(sideMargin, frameLeft - galleryGap - gallerySize);
    const galleryTop = Math.max(0, (frameHeight - gallerySize) / 2);

    return {
      scale,
      s,
      t,
      headerPadH,
      headerIcon,
      headerMinH,
      headerPadV,
      logoW,
      logoH,
      footerH,
      footerPadH,
      footerPadV,
      previewPadH,
      frameWidth: Math.round(frameWidth),
      frameHeight: Math.round(frameHeight),
      gallerySize: Math.round(gallerySize),
      galleryGap: Math.round(galleryGap),
      modeToggleH: Math.round(modeToggleH),
      modeBottom: Math.round(modeBottom),
      toggleWidth: Math.round(toggleWidth),
      captureSize: Math.round(captureSize),
      zoomSize: Math.round(zoomSize),
      searchSize: Math.round(searchSize),
      galleryLeft: Math.round(galleryLeft),
      galleryTop: Math.round(galleryTop)
    };
  }, [width, height, insets.top, insets.bottom]);
}
