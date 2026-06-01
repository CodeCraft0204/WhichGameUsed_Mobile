/** Camera / Create screen assets (assets/camera). */
export const cameraIcons = {
  logo: require('@/assets/camera/Logo-WhichGameUsed.png'),
  exit: require('@/assets/camera/exit.png'),
  flash: require('@/assets/camera/flash.png'),
  flashOff: require('@/assets/camera/flash_off.png'),
  tornEdge: require('@/assets/camera/bord.png'),
  gallery: require('@/assets/camera/thumb.png'),
  capture: require('@/assets/camera/capture.png'),
  search: require('@/assets/camera/search.png')
} as const;

export type CameraMode = 'front' | 'both';

/** Layout constants at 810 design width. */
export const cameraLayout = {
  logoWidth: 260,
  logoHeight: 64,
  frameWidth: 550,
  frameHeight: 850,
  frameInset: 22,
  gallerySize: 64,
  modeToggleHeight: 70,
  zoomSize: 56,
  captureSize: 96,
  searchSize: 44,
  tornEdgeHeight: 20,
  headerMinHeight: 58,
  footerMinHeight: 108,
  headerIconSize: 40
} as const;
