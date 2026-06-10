import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type CameraMode } from '@/constants/cameraContent';
import { figmaColors } from '@/constants/figmaColors';

type CameraModeToggleProps = {
  mode: CameraMode;
  onChange: (mode: CameraMode) => void;
  height: number;
  trackWidth: number;
  t: (n: number) => number;
};

export function CameraModeToggle({ mode, onChange, height, trackWidth, t }: CameraModeToggleProps) {
  const radius = height / 2;
  const pad = Math.max(2, Math.round(height * 0.043));
  const innerRadius = radius - pad;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.track,
          { width: trackWidth, height, borderRadius: radius, padding: pad }
        ]}
      >
      <Pressable
        style={[
          styles.segment,
          { height: height - pad * 2, borderRadius: innerRadius },
          mode === 'front' && styles.segmentActive
        ]}
        onPress={() => onChange('front')}
      >
        <Text style={[styles.label, { fontSize: t(13), lineHeight: t(15) }, mode === 'front' && styles.labelActive]}>
          FRONT
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.segment,
          { height: height - pad * 2, borderRadius: innerRadius },
          mode === 'both' && styles.segmentActive
        ]}
        onPress={() => onChange('both')}
      >
        <Text
          style={[styles.label, { fontSize: t(13), lineHeight: t(14) }, mode === 'both' && styles.labelActive]}
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
    alignItems: 'center'
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaColors.cameraControlBg
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
    color: figmaColors.sepia
  }
});
