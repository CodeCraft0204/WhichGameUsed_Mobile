import React from 'react';
import { StyleSheet, View } from 'react-native';

type CameraFrameOverlayProps = {
  width: number;
  height: number;
  inset?: number;
};

function CornerBracket({
  cornerLen,
  stroke,
  position
}: {
  cornerLen: number;
  stroke: number;
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const len = cornerLen;

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
          { width: len, height: stroke, backgroundColor: '#FFFFFF' }
        ]}
      />
      <View
        style={[
          styles.bar,
          verticalStyle,
          { width: stroke, height: len, backgroundColor: '#FFFFFF' }
        ]}
      />
    </View>
  );
}

export function CameraFrameOverlay({ width, height, inset }: CameraFrameOverlayProps) {
  const cornerLen = Math.min(width, height) * 0.065;
  const stroke = Math.max(2, cornerLen * 0.085);
  const insetPx = inset ?? Math.round(Math.min(width, height) * 0.04);
  const borderWidth = Math.max(1, stroke * 0.55);
  const borderRadius = Math.max(2, cornerLen * 0.12);

  return (
    <View style={[styles.wrap, { width, height }]}>
      <CornerBracket cornerLen={cornerLen} stroke={stroke} position="topLeft" />
      <CornerBracket cornerLen={cornerLen} stroke={stroke} position="topRight" />
      <CornerBracket cornerLen={cornerLen} stroke={stroke} position="bottomLeft" />
      <CornerBracket cornerLen={cornerLen} stroke={stroke} position="bottomRight" />

      <View
        style={[
          styles.innerGuide,
          {
            top: insetPx,
            left: insetPx,
            right: insetPx,
            bottom: insetPx,
            borderWidth,
            borderRadius
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
