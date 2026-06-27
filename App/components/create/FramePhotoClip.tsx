import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewStyle
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { photoAssetPreviewBackground } from '@/constants/photoEditorAssets';
import { figmaColors } from '@/constants/figmaColors';
import {
  clampFramePhotoOffset,
  clampFramePhotoScale,
  DEFAULT_FRAME_PHOTO_TRANSFORM,
  frameTopLeftHandlePosition,
  type FrameInsetPercents,
  type FramePhotoTransform
} from '@/components/create/framePhotoTransform';

const DRAG_THRESHOLD = 4;

type Props = {
  photoUri: string | null;
  clipInsets: Pick<ViewStyle, 'top' | 'left' | 'right' | 'bottom'>;
  /** Inset % used to anchor transform controls on the outer frame corner. */
  frameInsets: FrameInsetPercents;
  transform: FramePhotoTransform;
  selected: boolean;
  uiScale: number;
  placeholderLabel?: string;
  onSelect: () => void;
  onPickPhoto: () => void;
  onTransformChange: (next: FramePhotoTransform, transient?: boolean) => void;
  onTransformCommit: () => void;
};

export function FramePhotoClip({
  photoUri,
  clipInsets,
  frameInsets,
  transform,
  selected,
  uiScale,
  placeholderLabel = 'Tap to add photo',
  onSelect,
  onPickPhoto,
  onTransformChange,
  onTransformCommit
}: Props) {
  const [clipSize, setClipSize] = useState({ width: 0, height: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const clipSizeRef = useRef(clipSize);
  clipSizeRef.current = clipSize;
  const photoUriRef = useRef(photoUri);
  photoUriRef.current = photoUri;

  const handlersRef = useRef({
    onTransformChange,
    onTransformCommit,
    onSelect,
    onPickPhoto
  });
  handlersRef.current = { onTransformChange, onTransformCommit, onSelect, onPickPhoto };

  const panOrigin = useRef({ offsetX: 0, offsetY: 0 });
  const scaleOrigin = useRef({ scale: 1 });
  const rotateOrigin = useRef({ rotation: 0 });
  const draggedRef = useRef(false);

  const handleClipLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setClipSize({ width, height });
    }
  };

  const photoPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Boolean(photoUriRef.current),
        onStartShouldSetPanResponderCapture: () => Boolean(photoUriRef.current),
        onMoveShouldSetPanResponder: () => Boolean(photoUriRef.current),
        onMoveShouldSetPanResponderCapture: () => Boolean(photoUriRef.current),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          draggedRef.current = false;
          if (!photoUriRef.current) return;
          handlersRef.current.onSelect();
          const current = transformRef.current;
          panOrigin.current = { offsetX: current.offsetX, offsetY: current.offsetY };
        },
        onPanResponderMove: (_, gesture) => {
          if (!photoUriRef.current) return;
          if (
            !draggedRef.current &&
            (Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD)
          ) {
            draggedRef.current = true;
          }
          if (!draggedRef.current) return;

          const { width, height } = clipSizeRef.current;
          if (width <= 0 || height <= 0) return;
          const scale = transformRef.current.scale;
          const dxPct = (gesture.dx / width) * 100;
          const dyPct = (gesture.dy / height) * 100;
          handlersRef.current.onTransformChange(
            {
              ...transformRef.current,
              offsetX: clampFramePhotoOffset(panOrigin.current.offsetX + dxPct, scale),
              offsetY: clampFramePhotoOffset(panOrigin.current.offsetY + dyPct, scale)
            },
            true
          );
        },
        onPanResponderRelease: () => {
          if (photoUriRef.current) {
            handlersRef.current.onTransformCommit();
          }
          draggedRef.current = false;
        },
        onPanResponderTerminate: () => {
          if (photoUriRef.current) {
            handlersRef.current.onTransformCommit();
          }
          draggedRef.current = false;
        }
      }),
    []
  );

  const scalePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          handlersRef.current.onSelect();
          scaleOrigin.current = { scale: transformRef.current.scale };
        },
        onPanResponderMove: (_, gesture) => {
          const delta = (gesture.dx - gesture.dy) / 140;
          const scale = clampFramePhotoScale(scaleOrigin.current.scale + delta);
          handlersRef.current.onTransformChange(
            {
              ...transformRef.current,
              scale,
              offsetX: clampFramePhotoOffset(transformRef.current.offsetX, scale),
              offsetY: clampFramePhotoOffset(transformRef.current.offsetY, scale)
            },
            true
          );
        },
        onPanResponderRelease: () => handlersRef.current.onTransformCommit(),
        onPanResponderTerminate: () => handlersRef.current.onTransformCommit()
      }),
    []
  );

  const rotatePan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          handlersRef.current.onSelect();
          rotateOrigin.current.rotation = transformRef.current.rotation;
        },
        onPanResponderMove: (_, gesture) => {
          handlersRef.current.onTransformChange(
            {
              ...transformRef.current,
              rotation: rotateOrigin.current.rotation + gesture.dx * 0.45
            },
            true
          );
        },
        onPanResponderRelease: () => handlersRef.current.onTransformCommit(),
        onPanResponderTerminate: () => handlersRef.current.onTransformCommit()
      }),
    []
  );

  const activeTransform = transform ?? DEFAULT_FRAME_PHOTO_TRANSFORM;
  const translateX = (activeTransform.offsetX / 100) * clipSize.width;
  const translateY = (activeTransform.offsetY / 100) * clipSize.height;
  const handlePos = frameTopLeftHandlePosition(frameInsets);

  return (
    <View
      style={[styles.photoClip, clipInsets, selected && photoUri && styles.photoClipSelected]}
      collapsable={false}
      onLayout={handleClipLayout}
    >
      {photoUri ? (
        <View style={styles.photoClipInner} {...photoPan.panHandlers}>
          <View style={styles.photoStage}>
            {clipSize.width > 0 && clipSize.height > 0 ? (
              <View
                style={{
                  width: clipSize.width,
                  height: clipSize.height,
                  transform: [
                    { translateX },
                    { translateY },
                    { scale: activeTransform.scale },
                    { rotate: `${activeTransform.rotation}deg` }
                  ]
                }}
              >
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: clipSize.width, height: clipSize.height }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            )}
          </View>
        </View>
      ) : (
        <Pressable style={styles.photoClipInner} onPress={onPickPhoto}>
          <View style={styles.photoPlaceholder}>
            <Ionicons name="image-outline" size={22 * uiScale} color={figmaColors.gray} />
            <Text style={[styles.placeholderText, { fontSize: 11 * uiScale }]}>{placeholderLabel}</Text>
          </View>
        </Pressable>
      )}

      {selected && photoUri ? (
        <View
          style={[
            styles.transformBar,
            handlePos,
            { transform: [{ scale: uiScale }] }
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.transformBtn} {...photoPan.panHandlers}>
            <Ionicons name="move" size={11} color={figmaColors.buttonPrimaryText} />
          </View>
          <View style={[styles.transformBtn, styles.transformBtnAccent]} {...rotatePan.panHandlers}>
            <Ionicons name="refresh" size={10} color={figmaColors.white} />
          </View>
          <View style={[styles.transformBtn, styles.transformBtnAccent]} {...scalePan.panHandlers} />
          <Pressable style={styles.transformBtn} onPress={onPickPhoto} hitSlop={4}>
            <Ionicons name="swap-horizontal" size={11} color={figmaColors.buttonPrimaryText} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photoClip: {
    position: 'absolute',
    overflow: 'visible'
  },
  photoClipSelected: {
    zIndex: 3
  },
  photoClipInner: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: photoAssetPreviewBackground
  },
  photoStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  placeholderText: {
    fontFamily: appFonts.body,
    color: figmaColors.gray,
    textAlign: 'center'
  },
  transformBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    zIndex: 5
  },
  transformBtn: {
    width: 22,
    height: 18,
    borderRadius: 9,
    backgroundColor: figmaColors.buttonPrimaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: figmaColors.white
  },
  transformBtnAccent: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: figmaColors.accentStrong
  }
});
