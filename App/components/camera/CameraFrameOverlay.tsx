import React from 'react';
import { StyleSheet, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type CameraFrameOverlayProps = {
  width: number;
  height: number;
  s: (n: number) => number;
  inset?: number;
};

function CornerBracket({
  s,
  position
}: {
  s: (n: number) => number;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const len = s(36);
  const stroke = s(3);

  const anchor = {
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0 },
    bottomLeft: { bottom: 0, left: 0 },
    bottomRight: { bottom: 0, right: 0 }
  }[position];

  const horizontalStyle =
    position === 'bottomLeft' || position === 'bottomRight' ? { bottom: 0 } : { top: 0 };

  const verticalStyle =
    position === 'topRight' || position === 'bottomRight' ? { right: 0 } : { left: 0 };

  return (
    <View style={[styles.corner, anchor, { width: len, height: len }]}>
      <View
        style={[
          styles.bar,
          horizontalStyle,
          { width: len, height: stroke, backgroundColor: figmaColors.cream }
        ]}
      />
      <View
        style={[
          styles.bar,
          verticalStyle,
          { width: stroke, height: len, backgroundColor: figmaColors.cream }
        ]}
      />
    </View>
  );
}

export function CameraFrameOverlay({ width, height, s, inset = 22 }: CameraFrameOverlayProps) {
  const insetPx = s(inset);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <CornerBracket s={s} position="topLeft" />
      <CornerBracket s={s} position="topRight" />
      <CornerBracket s={s} position="bottomLeft" />
      <CornerBracket s={s} position="bottomRight" />

      <View
        style={[
          styles.innerGuide,
          {
            top: insetPx,
            left: insetPx,
            right: insetPx,
            bottom: insetPx,
            borderWidth: s(1.5),
            borderRadius: s(4)
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative'
  },
  corner: {
    position: 'absolute'
  },
  bar: {
    position: 'absolute'
  },
  innerGuide: {
    position: 'absolute',
    borderColor: 'rgba(245,245,240,0.9)',
    borderStyle: 'dashed'
  }
});
