import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { cameraIcons } from '@/constants/cameraContent';

type CameraFloatingControlsProps = {
  right: number;
  top: number;
  iconSize: number;
  onFlip: () => void;
};

export function CameraFloatingControls({ right, top, iconSize, onFlip }: CameraFloatingControlsProps) {
  return (
    <View style={[styles.rail, { right, top }]}>
      <Pressable
        style={[styles.btn, { width: iconSize, height: iconSize }]}
        onPress={onFlip}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Flip camera"
      >
        <Image
          source={cameraIcons.flip}
          style={{ width: iconSize * 0.7, height: iconSize * 0.7 }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
