import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CameraFrameOverlay } from '@/components/camera/CameraFrameOverlay';
import { CameraModeToggle } from '@/components/camera/CameraModeToggle';
import { cameraCopy } from '@/constants/cameraCopy';
import { cameraIcons, type CameraMode } from '@/constants/cameraContent';
import { figmaColors } from '@/constants/figmaColors';
import { useCameraLayout } from '@/hooks/useCameraLayout';
import { pickCardPhotoFromLibrary } from '@/lib/capture-photos';
import {
  CAMERA_ZOOM_STOPS,
  defaultZoomStopIndex,
  formatZoomLabel,
  nextZoomStopIndex,
  zoomStopToNormalized,
  type CameraZoomStop
} from '@/lib/camera-zoom';

export default function CameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ linkedCardKey?: string; linkedCardTitle?: string }>();
  const cameraRef = useRef<CameraView>(null);
  const layout = useCameraLayout();
  const styles = useMemo(() => createStyles(layout), [layout]);

  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [zoomStopIndex, setZoomStopIndex] = useState(defaultZoomStopIndex);
  const [mode, setMode] = useState<CameraMode>('front');
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [linkedCardTitle, setLinkedCardTitle] = useState<string | null>(null);

  const zoomStop = CAMERA_ZOOM_STOPS[zoomStopIndex];
  const cameraZoom = zoomStopToNormalized(zoomStop);

  const needsBack = mode === 'both';
  const shotStep = needsBack && frontUri && !backUri ? 'back' : 'front';
  const awaitingBackCapture = needsBack && frontUri !== null && backUri === null;

  useEffect(() => {
    if (typeof params.linkedCardTitle === 'string' && params.linkedCardTitle.length > 0) {
      setLinkedCardTitle(params.linkedCardTitle);
    }
  }, [params.linkedCardTitle]);

  const goToEditWith = (front: string, back: string | null) => {
    router.push({
      pathname: '/create/edit',
      params: {
        frontUri: front,
        ...(back ? { backUri: back } : {}),
        ...(typeof params.linkedCardKey === 'string' ? { linkedCardKey: params.linkedCardKey } : {}),
        ...(linkedCardTitle ? { linkedCardTitle } : {})
      }
    });
  };

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.88,
        skipProcessing: false
      });
      if (!photo?.uri) return;

      if (shotStep === 'front') {
        setFrontUri(photo.uri);
        if (!needsBack) {
          goToEditWith(photo.uri, null);
        }
        return;
      }

      setBackUri(photo.uri);
      goToEditWith(frontUri!, photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  const handleGallery = async () => {
    const uri = await pickCardPhotoFromLibrary();
    if (!uri) return;

    if (shotStep === 'front') {
      setFrontUri(uri);
      if (!needsBack) {
        goToEditWith(uri, null);
        return;
      }
      return;
    }

    setBackUri(uri);
    if (frontUri) goToEditWith(frontUri, uri);
  };

  const handleModeChange = (next: CameraMode) => {
    setMode(next);
    setFrontUri(null);
    setBackUri(null);
  };

  const handleZoomCycle = () => {
    setZoomStopIndex((index) => nextZoomStopIndex(index));
  };

  const handleSearch = () => {
    router.push('/camera/card-search');
  };

  if (!permission) {
    return <View style={styles.permissionRoot} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionRoot} edges={['top', 'bottom']}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>{cameraCopy.permissionTitle}</Text>
          <Text style={styles.permissionBody}>{cameraCopy.permissionBody}</Text>
          <AuthPrimaryButton
            label={cameraCopy.grantPermission}
            onPress={() => void requestPermission()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable
            style={styles.headerSide}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Exit camera"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/database/database');
              }
            }}
          >
            <Image source={cameraIcons.exit} style={styles.headerIcon} resizeMode="contain" />
          </Pressable>

          <View style={styles.logoWrap}>
            <Image source={cameraIcons.logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Pressable
            style={styles.headerSide}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={flashOn ? 'Turn flash off' : 'Turn flash on'}
            onPress={() => setFlashOn((value) => !value)}
          >
            <Image
              source={flashOn ? cameraIcons.flash : cameraIcons.flashOff}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {linkedCardTitle ? (
          <View style={styles.linkedBanner}>
            <Text style={styles.linkedBannerText} numberOfLines={1}>
              {cameraCopy.linkedCardPrefix} {linkedCardTitle}
            </Text>
          </View>
        ) : null}

        <View style={styles.previewArea}>
          <View style={styles.cameraClip}>
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              mirror={false}
              zoom={cameraZoom}
              flash={flashOn ? 'on' : 'off'}
              enableTorch={flashOn}
            />
          </View>

          {awaitingBackCapture ? (
            <View style={styles.captureNotice} pointerEvents="none">
              <Text style={styles.captureNoticeTitle}>{cameraCopy.frontCapturedTitle}</Text>
              <Text style={styles.captureNoticeBody}>{cameraCopy.frontCapturedBody}</Text>
            </View>
          ) : null}

          <View style={styles.previewCenter} pointerEvents="box-none">
            <View style={styles.frameStage} pointerEvents="box-none">
              <View style={styles.frameBox} pointerEvents="none">
                <CameraFrameOverlay
                  width={layout.frameWidth}
                  height={layout.frameHeight}
                />
              </View>

              <Pressable
                style={styles.gallerySlot}
                accessibilityRole="button"
                accessibilityLabel="Open photo library"
                onPress={() => void handleGallery()}
              >
                <Image source={cameraIcons.gallery} style={styles.galleryIcon} resizeMode="contain" />
              </Pressable>
            </View>
          </View>

          <View style={styles.modeSlot} pointerEvents="box-none">
            <CameraModeToggle
              mode={mode}
              onChange={handleModeChange}
              height={layout.modeToggleH}
              trackWidth={layout.toggleWidth}
              t={layout.t}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerSide}>
            <Pressable
              style={[styles.zoomButton, zoomStop !== 1 && styles.zoomButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={`Zoom ${formatZoomLabel(zoomStop)}`}
              onPress={handleZoomCycle}
            >
              <Text style={styles.zoomText}>{formatZoomLabel(zoomStop)}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.captureWrap}
            accessibilityRole="button"
            accessibilityLabel="Capture photo"
            disabled={capturing}
            onPress={() => void handleCapture()}
          >
            <Image source={cameraIcons.capture} style={styles.captureButton} resizeMode="contain" />
          </Pressable>

          <View style={[styles.footerSide, styles.footerSideEnd]}>
            <Pressable
              style={styles.sideControl}
              accessibilityRole="button"
              accessibilityLabel="Search card catalog"
              onPress={handleSearch}
            >
              <Image source={cameraIcons.search} style={styles.searchIcon} resizeMode="contain" />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(layout: ReturnType<typeof useCameraLayout>) {
  const { t } = layout;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    root: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    permissionRoot: {
      flex: 1,
      backgroundColor: figmaColors.background,
      padding: layout.s(24),
      justifyContent: 'center'
    },
    permissionCard: { gap: layout.s(16) },
    permissionTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: layout.t(22),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    permissionBody: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: layout.t(17),
      lineHeight: layout.t(24),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    header: {
      minHeight: layout.headerMinH,
      paddingHorizontal: layout.headerPadH,
      paddingVertical: layout.headerPadV,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: figmaColors.background
    },
    linkedBanner: {
      marginHorizontal: layout.headerPadH,
      marginBottom: layout.s(6),
      paddingVertical: layout.s(8),
      paddingHorizontal: layout.s(12),
      borderRadius: layout.s(8),
      backgroundColor: figmaColors.ctaBackground,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    linkedBannerText: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: layout.t(14),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    headerSide: {
      width: layout.headerIcon,
      height: layout.headerIcon,
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerIcon: {
      width: layout.headerIcon,
      height: layout.headerIcon
    },
    logoWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: layout.headerPadH * 0.5
    },
    logo: {
      width: layout.logoW,
      height: layout.logoH
    },
    previewArea: {
      flex: 1,
      backgroundColor: figmaColors.cameraChrome
    },
    cameraClip: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden'
    },
    // Preview-only flip: back-camera capture is correct; some devices mirror the live feed.
    cameraPreview: {
      ...StyleSheet.absoluteFillObject,
      transform: [{ scaleX: -1 }]
    },
    captureNotice: {
      position: 'absolute',
      top: layout.modeBottom,
      left: layout.previewPadH,
      right: layout.previewPadH,
      zIndex: 2,
      backgroundColor: 'rgba(59, 59, 59, 0.92)',
      borderRadius: layout.s(10),
      paddingVertical: layout.s(12),
      paddingHorizontal: layout.s(16),
      gap: layout.s(4)
    },
    captureNoticeTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: layout.t(18),
      color: figmaColors.cream,
      textAlign: 'center'
    },
    captureNoticeBody: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: layout.t(15),
      lineHeight: layout.t(20),
      color: figmaColors.cream,
      textAlign: 'center',
      opacity: 0.9
    },
    previewCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    frameStage: {
      width: '100%',
      alignItems: 'center',
      position: 'relative'
    },
    gallerySlot: {
      position: 'absolute',
      left: layout.galleryLeft,
      top: layout.galleryTop,
      width: layout.gallerySize,
      height: layout.gallerySize,
      alignItems: 'center',
      justifyContent: 'center'
    },
    galleryIcon: {
      width: layout.gallerySize,
      height: layout.gallerySize
    },
    frameBox: {
      width: layout.frameWidth,
      height: layout.frameHeight
    },
    modeSlot: {
      alignItems: 'center',
      paddingBottom: layout.modeBottom,
      paddingTop: layout.modeBottom * 0.5
    },
    footer: {
      minHeight: layout.footerH,
      paddingHorizontal: layout.footerPadH,
      paddingVertical: layout.footerPadV,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: figmaColors.background
    },
    footerSide: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    footerSideEnd: {
      alignItems: 'flex-end'
    },
    zoomButton: {
      width: layout.zoomSize,
      height: layout.zoomSize,
      borderRadius: layout.zoomSize / 2,
      backgroundColor: figmaColors.cameraControlBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    zoomButtonActive: {
      backgroundColor: figmaColors.charcoal
    },
    zoomText: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(20),
      lineHeight: t(22),
      color: figmaColors.cream
    },
    sideControl: {
      width: layout.searchSize,
      height: layout.searchSize,
      alignItems: 'center',
      justifyContent: 'center'
    },
    searchIcon: {
      width: layout.searchSize,
      height: layout.searchSize
    },
    captureWrap: {
      width: layout.captureSize,
      height: layout.captureSize,
      alignItems: 'center',
      justifyContent: 'center'
    },
    captureButton: {
      width: layout.captureSize,
      height: layout.captureSize
    }
  });
}
