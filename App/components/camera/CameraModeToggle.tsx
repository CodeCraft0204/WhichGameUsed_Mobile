import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cameraLayout, type CameraMode } from '@/constants/cameraContent';
import { figmaColors } from '@/constants/figmaColors';

type CameraModeToggleProps = {
  mode: CameraMode;
  onChange: (mode: CameraMode) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CameraModeToggle({ mode, onChange, s, t }: CameraModeToggleProps) {
  const height = s(cameraLayout.modeToggleHeight);
  const radius = height / 2;

  return (
    <View style={styles.wrap}>
      <View style={[styles.track, { height, borderRadius: radius, padding: s(3) }]}>
      <Pressable
        style={[
          styles.segment,
          { height: height - s(6), borderRadius: radius - s(3) },
          mode === 'front' && styles.segmentActive
        ]}
        onPress={() => onChange('front')}
      >
        <Text style={[styles.label, { fontSize: t(20), lineHeight: t(18) }, mode === 'front' && styles.labelActive]}>
          FRONT
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.segment,
          { height: height - s(6), borderRadius: radius - s(3) },
          mode === 'both' && styles.segmentActive
        ]}
        onPress={() => onChange('both')}
      >
        <Text
          style={[styles.label, { fontSize: t(20), lineHeight: t(16) }, mode === 'both' && styles.labelActive]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          FRONT+BACK
        </Text>
      </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  track: {
    margin:'10%',
    width: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a4a4a'
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  segmentActive: {
    backgroundColor: figmaColors.cream
  },
  label: {
    fontFamily: 'PermanentMarker_400Regular',
    color: 'rgba(245,245,240,0.55)',
    textAlign: 'center'
  },
  labelActive: {
    color: figmaColors.black
  }
});
