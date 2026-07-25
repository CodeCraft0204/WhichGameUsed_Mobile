import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CameraFrameOverlay } from '@/components/camera/CameraFrameOverlay';
import { appFonts } from '@/constants/appFonts';
import { cameraCopy } from '@/constants/cameraCopy';
import { cameraIcons } from '@/constants/cameraContent';
import { figmaColors } from '@/constants/figmaColors';
import { databaseVerificationHref, databaseVerifyHref, safeGoBack } from '@/constants/navigation';
import { useCameraLayout } from '@/hooks/useCameraLayout';
import {
  CAMERA_ZOOM_STOPS,
  defaultZoomStopIndex,
  formatZoomLabel,
  nextZoomStopIndex,
  zoomStopToNormalized
} from '@/lib/camera-zoom';
import { assetCodeFromScanPayload } from '@/lib/verification';

export default function VerifyScanScreen() {
  const router = useRouter();
  const layout = useCameraLayout();
  const styles = useMemo(() => createStyles(layout), [layout]);
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [zoomStopIndex, setZoomStopIndex] = useState(defaultZoomStopIndex);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);

  const zoomStop = CAMERA_ZOOM_STOPS[zoomStopIndex];
  const cameraZoom = zoomStopToNormalized(zoomStop);

  function onBarcode({ data }: { data: string }) {
    if (locked.current) return;
    const code = assetCodeFromScanPayload(data);
    if (!code) {
      setError('No asset ID found in that QR. Try again.');
      return;
    }
    locked.current = true;
    router.replace(databaseVerificationHref(code));
  }

  function resetScanner() {
    locked.current = false;
    setError(null);
  }

  if (!permission) {
    return <View style={styles.permissionRoot} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionRoot} edges={['top', 'bottom']}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>{cameraCopy.permissionTitle}</Text>
          <Text style={styles.permissionBody}>
            Allow camera access to scan your Which Game Used sticker QR.
          </Text>
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
            accessibilityLabel="Exit scanner"
            onPress={() => safeGoBack(databaseVerifyHref())}
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

        <View style={styles.hintBanner}>
          <Text style={styles.hintBannerText}>Point at the Which Game Used QR on your sticker</Text>
        </View>

        <View style={styles.previewArea}>
          <View style={styles.cameraClip}>
            <CameraView
              style={styles.cameraPreview}
              facing="back"
              zoom={cameraZoom}
              enableTorch={flashOn}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={onBarcode}
            />
          </View>

          {error ? (
            <View style={styles.captureNotice} pointerEvents="none">
              <Text style={styles.captureNoticeTitle}>Couldn’t read QR</Text>
              <Text style={styles.captureNoticeBody}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.previewCenter} pointerEvents="box-none">
            <View style={styles.frameStage} pointerEvents="box-none">
              <View style={styles.frameBox} pointerEvents="none">
                <CameraFrameOverlay width={layout.frameWidth} height={layout.frameHeight} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerSide}>
            <Pressable
              style={[styles.zoomButton, zoomStop !== 1 && styles.zoomButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={`Zoom ${formatZoomLabel(zoomStop)}`}
              onPress={() => setZoomStopIndex((index) => nextZoomStopIndex(index))}
            >
              <Text style={styles.zoomText}>{formatZoomLabel(zoomStop)}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.resetButton}
            accessibilityRole="button"
            accessibilityLabel="Reset scanner"
            onPress={resetScanner}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>

          <View style={[styles.footerSide, styles.footerSideEnd]} />
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
      fontFamily: appFonts.body,
      fontSize: layout.t(22),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    permissionBody: {
      fontFamily: appFonts.body,
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
    hintBanner: {
      marginHorizontal: layout.headerPadH,
      marginBottom: layout.s(6),
      paddingVertical: layout.s(8),
      paddingHorizontal: layout.s(12),
      borderRadius: layout.s(8),
      backgroundColor: figmaColors.ctaBackground,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    hintBannerText: {
      fontFamily: appFonts.body,
      fontSize: layout.t(14),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    previewArea: {
      flex: 1,
      backgroundColor: figmaColors.cameraChrome
    },
    cameraClip: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden'
    },
    cameraPreview: {
      ...StyleSheet.absoluteFillObject
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
      fontFamily: appFonts.body,
      fontSize: layout.t(18),
      color: figmaColors.cream,
      textAlign: 'center'
    },
    captureNoticeBody: {
      fontFamily: appFonts.body,
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
    frameBox: {
      width: layout.frameWidth,
      height: layout.frameHeight
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
      fontFamily: appFonts.display,
      fontSize: t(20),
      lineHeight: t(22),
      color: figmaColors.cream
    },
    resetButton: {
      minWidth: layout.captureSize,
      height: layout.s(44),
      paddingHorizontal: layout.s(18),
      borderRadius: layout.s(22),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: layout.s(2),
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    resetText: {
      fontFamily: appFonts.display,
      fontSize: layout.t(18),
      color: figmaColors.buttonPrimaryText
    }
  });
}
