import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle
} from 'react-native';
import { FramePhotoClip } from '@/components/create/FramePhotoClip';
import {
  DEFAULT_FRAME_PHOTO_TRANSFORM,
  type FramePhotoTransform
} from '@/components/create/framePhotoTransform';
import { appFonts } from '@/constants/appFonts';
import { photoFrames, photoShapes } from '@/constants/photoEditorAssets';
import { getPhotoFrameInsets, type PhotoTemplate } from '@/constants/photoEditorTemplates';
import { figmaColors } from '@/constants/figmaColors';

export type SlotPhotos = Record<string, string | null>;
export type SlotTexts = Record<string, string>;
export type SlotPhotoTransforms = Record<string, FramePhotoTransform>;

type PhotoEditorCanvasProps = {
  template: PhotoTemplate;
  slotPhotos: SlotPhotos;
  slotTexts: SlotTexts;
  onSlotPhotoChange: (slotId: string, uri: string | null) => void;
  onSlotTextChange: (slotId: string, text: string) => void;
  scale?: number;
  width?: number;
  height?: number;
  style?: ViewStyle;
};

export const PhotoEditorCanvas = React.forwardRef<View, PhotoEditorCanvasProps>(
  function PhotoEditorCanvas(
    {
      template,
      slotPhotos,
      slotTexts,
      onSlotPhotoChange,
      onSlotTextChange,
      scale = 1,
      width,
      height,
      style
    },
    ref
  ) {
    const layoutScale =
      width != null && height != null ? width / template.canvasWidth : scale;
    const styles = useMemo(() => createStyles(layoutScale), [layoutScale]);
    const w = width ?? template.canvasWidth * scale;
    const h = height ?? template.canvasHeight * scale;

    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [slotTransforms, setSlotTransforms] = useState<SlotPhotoTransforms>({});

    const getTransform = useCallback(
      (slotId: string): FramePhotoTransform =>
        slotTransforms[slotId] ?? DEFAULT_FRAME_PHOTO_TRANSFORM,
      [slotTransforms]
    );

    const pickForSlot = async (slotId: string) => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onSlotPhotoChange(slotId, result.assets[0].uri);
        setSlotTransforms((prev) => ({ ...prev, [slotId]: DEFAULT_FRAME_PHOTO_TRANSFORM }));
        setSelectedSlotId(slotId);
      }
    };

    return (
      <View ref={ref} style={[styles.canvas, { width: w, height: h }, style]} collapsable={false}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedSlotId(null)} />
        {template.slots.map((slot) => {
            const photoUri = slotPhotos[slot.id];
            const insets = getPhotoFrameInsets(slot.frame);

            return (
              <View
                key={slot.id}
                style={[
                  styles.slot,
                  {
                    left: `${slot.left}%`,
                    top: `${slot.top}%`,
                    width: `${slot.width}%`,
                    height: `${slot.height}%`
                  },
                  selectedSlotId === slot.id && styles.slotActive
                ]}
              >
                <FramePhotoClip
                  photoUri={photoUri}
                  clipInsets={{
                    top: `${insets.insetTop}%`,
                    left: `${insets.insetLeft}%`,
                    right: `${insets.insetRight}%`,
                    bottom: `${insets.insetBottom}%`
                  }}
                  frameInsets={{
                    top: insets.insetTop,
                    left: insets.insetLeft,
                    right: insets.insetRight,
                    bottom: insets.insetBottom
                  }}
                  transform={getTransform(slot.id)}
                  selected={selectedSlotId === slot.id}
                  uiScale={layoutScale}
                  placeholderLabel="Tap to add photo"
                  onSelect={() => setSelectedSlotId(slot.id)}
                  onPickPhoto={() => void pickForSlot(slot.id)}
                  onTransformChange={(next) =>
                    setSlotTransforms((prev) => ({ ...prev, [slot.id]: next }))
                  }
                  onTransformCommit={() => {}}
                />
                <View pointerEvents="none" style={styles.frameOverlay}>
                  <Image
                    source={photoFrames[slot.frame]}
                    style={styles.frameImage}
                    resizeMode="stretch"
                  />
                </View>
              </View>
            );
          })}

          {template.decor?.map((shape, i) => (
            <View
              key={`decor-${i}`}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: `${shape.left}%`,
                top: `${shape.top}%`,
                width: `${shape.width}%`,
                height: `${shape.height}%`
              }}
            >
              <Image
                source={photoShapes[shape.asset]}
                style={styles.decorImage}
                resizeMode="contain"
              />
            </View>
          ))}

          {template.textSlots.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.textSlotWrap,
                {
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`
                }
              ]}
            >
              <TextInput
                style={[
                  styles.textSlotInput,
                  { fontSize: slot.fontSize * layoutScale, lineHeight: slot.fontSize * layoutScale * 1.35 }
                ]}
                value={slotTexts[slot.id] ?? ''}
                onChangeText={(text) => onSlotTextChange(slot.id, text)}
                placeholder={slot.placeholder}
                placeholderTextColor={figmaColors.textMuted}
                multiline
                scrollEnabled
                textAlignVertical="top"
                onFocus={() => setSelectedSlotId(null)}
              />
            </View>
          ))}
      </View>
    );
  }
);

function createStyles(scale: number) {
  return StyleSheet.create({
    canvas: {
      backgroundColor: figmaColors.parchment,
      overflow: 'hidden'
    },
    slot: {
      position: 'absolute',
      zIndex: 1
    },
    slotActive: {
      zIndex: 10
    },
    frameOverlay: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%'
    },
    frameImage: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%'
    },
    decorImage: {
      width: '100%',
      height: '100%'
    },
    textSlotWrap: {
      position: 'absolute',
      overflow: 'hidden',
      paddingHorizontal: 4 * scale,
      paddingVertical: 3 * scale
    },
    textSlotInput: {
      flex: 1,
      width: '100%',
      height: '100%',
      fontFamily: appFonts.accent,
      color: figmaColors.charcoal,
      padding: 0,
      margin: 0
    }
  });
}
