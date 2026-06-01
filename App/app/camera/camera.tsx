import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraFrameOverlay } from '@/components/camera/CameraFrameOverlay';
import { CameraModeToggle } from '@/components/camera/CameraModeToggle';
import { cameraIcons, cameraLayout, type CameraMode } from '@/constants/cameraContent';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function CameraScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [flashOn, setFlashOn] = useState(true);
  const [mode, setMode] = useState<CameraMode>('front');

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
            <Image source={cameraIcons.exit} style={styles.exitIcon} resizeMode="contain" />
          </Pressable>
          <Image source={cameraIcons.logo} style={styles.logo} resizeMode="contain" />
          <Pressable
            style={styles.headerSide}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={flashOn ? 'Turn flash off' : 'Turn flash on'}
            onPress={() => setFlashOn((value) => !value)}
          >
            <Image
              source={flashOn ? cameraIcons.flash : cameraIcons.flashOff}
              style={styles.flashIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        {/* <Image source={cameraIcons.tornEdge} style={styles.tornEdgeTop} resizeMode="stretch" /> */}

        <View style={styles.previewArea}>
          <View style={styles.cameraSection}>
            <CameraFrameOverlay s={s} width={s(cameraLayout.frameWidth)} height={s(cameraLayout.frameHeight)} />

            <Pressable
              style={styles.gallerySlot}
              accessibilityRole="button"
              accessibilityLabel="Open photo library"
            >
              <Image source={cameraIcons.gallery} style={styles.galleryIcon} resizeMode="contain" />
            </Pressable>

            <View style={styles.modeSlot}>
              <CameraModeToggle mode={mode} onChange={setMode} s={s} t={t} />
            </View>
          </View>
        </View>

        {/* <Image source={cameraIcons.tornEdge} style={styles.tornEdgeBottom} resizeMode="stretch" /> */}

        <View style={styles.footer}>
          <Pressable style={styles.zoomButton} accessibilityRole="button" accessibilityLabel="Zoom 0.5x">
            <Text style={styles.zoomText}>.5x</Text>
          </Pressable>

          <Pressable style={styles.captureWrap} accessibilityRole="button" accessibilityLabel="Capture photo">
            <Image source={cameraIcons.capture} style={styles.captureButton} resizeMode="contain" />
          </Pressable>

          <Pressable style={styles.sideControl} accessibilityRole="button" accessibilityLabel="Search">
            <Image source={cameraIcons.search} style={styles.searchIcon} resizeMode="contain" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const gallerySize = s(cameraLayout.gallerySize * 1.5);
  const galleryHalf = gallerySize / 1.5;
  const frameHeight = s(cameraLayout.frameHeight);

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    root: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    header: {
      minHeight: s(cameraLayout.headerMinHeight),
      paddingHorizontal: s(20),
      paddingVertical: s(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: figmaColors.background
    },
    headerSide: {
      width: s(48),
      height: s(48),
      alignItems: 'center',
      justifyContent: 'center'
    },
    exitIcon: {
      marginTop: s(100),
      width: s(90),
      height: s(90)
    },
    logo: {
      flex: 1,
      marginTop: s(60),
      width: s(cameraLayout.logoWidth * 2),
      height: s(cameraLayout.logoHeight * 2),
      maxWidth: s(cameraLayout.logoWidth * 2)
    },
    flashIcon: {
      marginTop: s(105),
      width: s(70),
      height: s(70)
    },
    tornEdgeTop: {
      width: '100%',
      height: s(cameraLayout.tornEdgeHeight)
    },
    tornEdgeBottom: {
      width: '100%',
      height: s(cameraLayout.tornEdgeHeight),
      transform: [{ scaleY: -1 }]
    },
    previewArea: {
      flex: 1,
      backgroundColor: '#2f3134',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20),
      paddingVertical: s(16)
    },
    cameraSection: {
      width: '100%',
      alignItems: 'center',
      marginTop: s(110),
      position: 'relative'
    },
    gallerySlot: {
      position: 'absolute',
      left: '2%',
      top: frameHeight / 2 - galleryHalf,
    },
    galleryIcon: {
      width: gallerySize,
      height: gallerySize
    },
    modeSlot: {
      marginTop: s(-20),
      width: '100%',
      paddingHorizontal: s(10),
      alignItems: 'center'
    },
    footer: {
      minHeight: s(cameraLayout.footerMinHeight),
      paddingHorizontal: s(80),
      paddingTop: s(18),
      paddingBottom: s(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: figmaColors.background
    },
    zoomButton: {
      width: s(cameraLayout.zoomSize * 1.5),
      height: s(cameraLayout.zoomSize * 1.5),
      borderRadius: s(cameraLayout.zoomSize),
      backgroundColor: '#4a4a4a',
      alignItems: 'center',
      justifyContent: 'center'
    },
    zoomText: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(23),
      lineHeight: t(20),
      color: figmaColors.cream
    },
    sideControl: {
      width: s(56),
      height: s(56),
      alignItems: 'center',
      justifyContent: 'center'
    },
    captureWrap: {
      width: s(cameraLayout.captureSize * 1.5),
      height: s(cameraLayout.captureSize * 2.3),
      alignItems: 'center',
      justifyContent: 'center'
    },
    captureButton: {
      width: s(cameraLayout.captureSize * 1.8),
      height: s(cameraLayout.captureSize * 1.8)
    },
    searchIcon: {
      width: s(cameraLayout.searchSize * 2),
      height: s(cameraLayout.searchSize * 2),
    }
  });
}
