import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

const CAMERA_DESIGN_WIDTH = 664;

const icons = {
  exit: require('@/assets/camera/exit.png'),
  logo: require('@/assets/camera/logo.png'),
  search: require('@/assets/camera/search.png'),
  flash: require('@/assets/camera/flash.png'),
  flashOff: require('@/assets/camera/flash_off.png'),
  frame: require('@/assets/camera/frame.png'),
  zoom: require('@/assets/camera/zoom.png'),
  capture: require('@/assets/camera/capture.png'),
  flip: require('@/assets/camera/flip.png')
};

export default function CameraScreen() {
  const { width, height } = useWindowDimensions();
  const layoutScale = Math.min(width / CAMERA_DESIGN_WIDTH, 1);
  const s = (value: number) => Math.round(value * layoutScale);
  const styles = useMemo(() => createStyles(s, height), [layoutScale, height]);
  const [flashOn, setFlashOn] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Link href="/database/database" asChild>
            <Pressable style={styles.topIconBtn} hitSlop={12}>
              <Image source={icons.exit} style={styles.exitIcon} resizeMode="contain" />
            </Pressable>
          </Link>
          <Image source={icons.logo} style={styles.logo} resizeMode="contain" />
          <Pressable style={styles.topIconBtn} onPress={() => setFlashOn((v) => !v)} hitSlop={12}>
            <Image source={flashOn ? icons.flash : icons.flashOff} style={styles.flashIcon} resizeMode="contain" />
          </Pressable>
        </View>

        <View style={styles.previewArea}>
          <Image source={icons.frame} style={styles.frame} resizeMode="contain" />
        </View>

        <View style={styles.bottomBar}>
          <Pressable style={styles.sideControl}>
            <Image source={icons.zoom} style={styles.sideIcon} resizeMode="contain" />
          </Pressable>
          <Pressable style={styles.captureWrap}>
            <Image source={icons.capture} style={styles.captureButton} resizeMode="contain" />
          </Pressable>
          <Pressable style={styles.sideControl}>
            <Image source={icons.flip} style={styles.sideIcon} resizeMode="contain" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, screenHeight: number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: '#1a1b1d'
    },
    root: {
      flex: 1,
      paddingHorizontal: s(20),
      paddingTop: s(8),
      paddingBottom: s(12),
      justifyContent: 'space-between'
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: s(56)
    },
    topIconBtn: {
      width: s(48),
      height: s(48),
      alignItems: 'center',
      justifyContent: 'center'
    },
    exitIcon: {
      width: s(40),
      height: s(40)
    },
    logo: {
      width: s(120),
      height: s(36)
    },
    flashIcon: {
      width: s(44),
      height: s(44)
    },
    previewArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Math.min(screenHeight * 0.55, s(520))
    },
    frame: {
      width: s(580),
      height: s(720),
      maxWidth: '92%',
      maxHeight: '70%'
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      paddingTop: s(16),
      minHeight: s(120)
    },
    sideControl: {
      width: s(72),
      height: s(72),
      alignItems: 'center',
      justifyContent: 'center'
    },
    sideIcon: {
      width: s(64),
      height: s(64)
    },
    captureWrap: {
      width: s(108),
      height: s(108),
      alignItems: 'center',
      justifyContent: 'center'
    },
    captureButton: {
      width: s(108),
      height: s(108)
    }
  });
}
