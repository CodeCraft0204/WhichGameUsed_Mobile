import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { photoFrames, photoShapes, photoAssetPreviewBackground } from '@/constants/photoEditorAssets';
import { getPhotoFrameInsets, type PhotoTemplate } from '@/constants/photoEditorTemplates';
import { figmaColors } from '@/constants/figmaColors';

export type SlotPhotos = Record<string, string | null>;
export type SlotTexts = Record<string, string>;

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
      width != null && height != null
        ? width / template.canvasWidth
        : scale;
    const styles = useMemo(() => createStyles(layoutScale), [layoutScale]);
    const w = width ?? template.canvasWidth * scale;
    const h = height ?? template.canvasHeight * scale;

    const pickForSlot = async (slotId: string) => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onSlotPhotoChange(slotId, result.assets[0].uri);
      }
    };

    return (
      <View ref={ref} style={[styles.canvas, { width: w, height: h }, style]} collapsable={false}>
        {template.slots.map((slot) => {
          const photoUri = slotPhotos[slot.id];
          const { insetTop, insetLeft, insetRight, insetBottom } = getPhotoFrameInsets(slot.frame);

          return (
            <Pressable
              key={slot.id}
              style={[
                styles.slot,
                {
                  left: `${slot.left}%`,
                  top: `${slot.top}%`,
                  width: `${slot.width}%`,
                  height: `${slot.height}%`
                }
              ]}
              onPress={() => void pickForSlot(slot.id)}
            >
              <View
                style={[
                  styles.photoClip,
                  {
                    top: `${insetTop}%`,
                    left: `${insetLeft}%`,
                    right: `${insetRight}%`,
                    bottom: `${insetBottom}%`
                  }
                ]}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="image-outline" size={22 * layoutScale} color={figmaColors.gray} />
                    <Text style={styles.placeholderText}>Tap to add photo</Text>
                  </View>
                )}
              </View>
              <View pointerEvents="none" style={styles.frameOverlay}>
                <Image
                  source={photoFrames[slot.frame]}
                  style={styles.frameImage}
                  resizeMode="stretch"
                />
              </View>
            </Pressable>
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
      position: 'absolute'
    },
    photoClip: {
      position: 'absolute',
      overflow: 'hidden',
      backgroundColor: photoAssetPreviewBackground
    },
    photo: {
      width: '100%',
      height: '100%'
    },
    photoPlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4 * scale
    },
    placeholderText: {
      fontFamily: appFonts.body,
      fontSize: 11 * scale,
      color: figmaColors.gray
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
