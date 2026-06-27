import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
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

type TransformTool = 'move' | 'rotate' | 'scale';

type Props = {
  photoUri: string | null;
  clipInsets: Pick<ViewStyle, 'top' | 'left' | 'right' | 'bottom'>;
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

function touchDistance(
  a: { pageX: number; pageY: number },
  b: { pageX: number; pageY: number }
): number {
  return Math.hypot(b.pageX - a.pageX, b.pageY - a.pageY);
}

function touchAngleDeg(
  centerX: number,
  centerY: number,
  pageX: number,
  pageY: number
): number {
  return (Math.atan2(pageY - centerY, pageX - centerX) * 180) / Math.PI;
}

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
  const [activeTool, setActiveTool] = useState<TransformTool>('move');

  const transformRef = useRef(transform);
  transformRef.current = transform;
  const clipSizeRef = useRef(clipSize);
  clipSizeRef.current = clipSize;
  const photoUriRef = useRef(photoUri);
  photoUriRef.current = photoUri;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const activeToolRef = useRef(activeTool);
  activeToolRef.current = activeTool;

  const clipOriginRef = useRef({ x: 0, y: 0 });
  const clipRef = useRef<View>(null);

  const handlersRef = useRef({
    onTransformChange,
    onTransformCommit,
    onSelect,
    onPickPhoto
  });
  handlersRef.current = { onTransformChange, onTransformCommit, onSelect, onPickPhoto };

  const moveOrigin = useRef({ offsetX: 0, offsetY: 0, pageX: 0, pageY: 0 });
  const rotateOrigin = useRef({ rotation: 0, startAngle: 0 });
  const scaleOrigin = useRef({ scale: 1, startDistance: 0, mode: 'pinch' as 'pinch' | 'drag' });
  const pinchingRef = useRef(false);

  const applyScale = useCallback((scale: number) => {
    const nextScale = clampFramePhotoScale(scale);
    const current = transformRef.current;
    handlersRef.current.onTransformChange(
      {
        ...current,
        scale: nextScale,
        offsetX: clampFramePhotoOffset(current.offsetX, nextScale),
        offsetY: clampFramePhotoOffset(current.offsetY, nextScale)
      },
      true
    );
  }, []);

  const applyPanFromDelta = useCallback((dx: number, dy: number) => {
    const { width, height } = clipSizeRef.current;
    if (width <= 0 || height <= 0) return;
    const scale = transformRef.current.scale;
    const dxPct = (dx / width) * 100;
    const dyPct = (dy / height) * 100;
    handlersRef.current.onTransformChange(
      {
        ...transformRef.current,
        offsetX: clampFramePhotoOffset(moveOrigin.current.offsetX + dxPct, scale),
        offsetY: clampFramePhotoOffset(moveOrigin.current.offsetY + dyPct, scale)
      },
      true
    );
  }, []);

  const syncClipOrigin = useCallback(() => {
    clipRef.current?.measureInWindow((x, y) => {
      clipOriginRef.current = { x, y };
    });
  }, []);

  const handleClipLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setClipSize({ width, height });
    }
    syncClipOrigin();
  };

  const beginMove = (pageX: number, pageY: number) => {
    handlersRef.current.onSelect();
    setActiveTool('move');
    const current = transformRef.current;
    moveOrigin.current = {
      offsetX: current.offsetX,
      offsetY: current.offsetY,
      pageX,
      pageY
    };
  };

  const beginRotate = (pageX: number, pageY: number) => {
    handlersRef.current.onSelect();
    setActiveTool('rotate');
    syncClipOrigin();
    const { width, height } = clipSizeRef.current;
    const centerX = clipOriginRef.current.x + width / 2;
    const centerY = clipOriginRef.current.y + height / 2;
    rotateOrigin.current = {
      rotation: transformRef.current.rotation,
      startAngle: touchAngleDeg(centerX, centerY, pageX, pageY)
    };
  };

  const beginScaleDrag = (pageY: number) => {
    handlersRef.current.onSelect();
    setActiveTool('scale');
    scaleOrigin.current = {
      scale: transformRef.current.scale,
      startDistance: 0,
      mode: 'drag'
    };
    moveOrigin.current.pageY = pageY;
  };

  const beginPinch = (touches: readonly { pageX: number; pageY: number }[]) => {
    if (touches.length < 2) return;
    handlersRef.current.onSelect();
    setActiveTool('scale');
    pinchingRef.current = true;
    scaleOrigin.current = {
      scale: transformRef.current.scale,
      startDistance: touchDistance(touches[0], touches[1]),
      mode: 'pinch'
    };
  };

  const handlePhotoTouchStart = (event: GestureResponderEvent) => {
    if (!photoUriRef.current) return;
    handlersRef.current.onSelect();
    syncClipOrigin();
    const touches = event.nativeEvent.touches;
    if (touches.length >= 2) {
      beginPinch(touches);
      return;
    }
    const { pageX, pageY } = event.nativeEvent;
    const tool = activeToolRef.current;
    if (tool === 'move') beginMove(pageX, pageY);
    else if (tool === 'rotate') beginRotate(pageX, pageY);
    else beginScaleDrag(pageY);
  };

  const handlePhotoTouchMove = (event: GestureResponderEvent) => {
    if (!photoUriRef.current) return;
    const touches = event.nativeEvent.touches;

    if (touches.length >= 2) {
      if (!pinchingRef.current) beginPinch(touches);
      const startDistance = scaleOrigin.current.startDistance;
      if (startDistance <= 0) return;
      const nextDistance = touchDistance(touches[0], touches[1]);
      applyScale(scaleOrigin.current.scale * (nextDistance / startDistance));
      return;
    }

    pinchingRef.current = false;
    const { pageX, pageY } = event.nativeEvent;
    const tool = activeToolRef.current;

    if (tool === 'move') {
      applyPanFromDelta(pageX - moveOrigin.current.pageX, pageY - moveOrigin.current.pageY);
      return;
    }

    if (tool === 'rotate') {
      const { width, height } = clipSizeRef.current;
      const centerX = clipOriginRef.current.x + width / 2;
      const centerY = clipOriginRef.current.y + height / 2;
      const angle = touchAngleDeg(centerX, centerY, pageX, pageY);
      handlersRef.current.onTransformChange(
        {
          ...transformRef.current,
          rotation: rotateOrigin.current.rotation + (angle - rotateOrigin.current.startAngle)
        },
        true
      );
      return;
    }

    if (tool === 'scale' && scaleOrigin.current.mode === 'drag') {
      const delta = (pageY - moveOrigin.current.pageY) / 120;
      applyScale(scaleOrigin.current.scale - delta);
    }
  };

  const handlePhotoTouchEnd = () => {
    if (!photoUriRef.current) return;
    pinchingRef.current = false;
    handlersRef.current.onTransformCommit();
  };

  const moveButtonPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_, gesture) => {
          beginMove(gesture.x0, gesture.y0);
        },
        onPanResponderMove: (_, gesture) => {
          applyPanFromDelta(gesture.dx, gesture.dy);
        },
        onPanResponderRelease: () => handlersRef.current.onTransformCommit(),
        onPanResponderTerminate: () => handlersRef.current.onTransformCommit()
      }),
    [applyPanFromDelta]
  );

  const rotateButtonPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          beginRotate(event.nativeEvent.pageX, event.nativeEvent.pageY);
        },
        onPanResponderMove: (event) => {
          const { width, height } = clipSizeRef.current;
          const centerX = clipOriginRef.current.x + width / 2;
          const centerY = clipOriginRef.current.y + height / 2;
          const { pageX, pageY } = event.nativeEvent;
          const angle = touchAngleDeg(centerX, centerY, pageX, pageY);
          handlersRef.current.onTransformChange(
            {
              ...transformRef.current,
              rotation: rotateOrigin.current.rotation + (angle - rotateOrigin.current.startAngle)
            },
            true
          );
        },
        onPanResponderRelease: () => handlersRef.current.onTransformCommit(),
        onPanResponderTerminate: () => handlersRef.current.onTransformCommit()
      }),
    []
  );

  const scaleButtonPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_, gesture) => {
          beginScaleDrag(gesture.y0);
          moveOrigin.current.pageY = gesture.y0;
        },
        onPanResponderMove: (_, gesture) => {
          const delta = (gesture.dx - gesture.dy) / 140;
          applyScale(scaleOrigin.current.scale + delta);
        },
        onPanResponderRelease: () => handlersRef.current.onTransformCommit(),
        onPanResponderTerminate: () => handlersRef.current.onTransformCommit()
      }),
    [applyScale]
  );

  const activeTransform = transform ?? DEFAULT_FRAME_PHOTO_TRANSFORM;
  const translateX = (activeTransform.offsetX / 100) * clipSize.width;
  const translateY = (activeTransform.offsetY / 100) * clipSize.height;
  const handlePos = frameTopLeftHandlePosition(frameInsets);

  const toolBtn = (tool: TransformTool, isActive: boolean): ViewStyle[] =>
    isActive
      ? [styles.transformBtn, styles.transformBtnActive]
      : [styles.transformBtn];

  return (
    <View
      ref={clipRef}
      style={[styles.photoClip, clipInsets, selected && photoUri && styles.photoClipSelected]}
      collapsable={false}
      onLayout={handleClipLayout}
    >
      {photoUri ? (
        <View
          style={styles.photoClipInner}
          onTouchStart={handlePhotoTouchStart}
          onTouchMove={handlePhotoTouchMove}
          onTouchEnd={handlePhotoTouchEnd}
          onTouchCancel={handlePhotoTouchEnd}
        >
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
          style={[styles.transformBar, handlePos, { transform: [{ scale: uiScale }] }]}
          pointerEvents="box-none"
        >
          <View style={toolBtn('move', activeTool === 'move')} {...moveButtonPan.panHandlers}>
            <Pressable style={styles.transformBtnInner} onPress={() => setActiveTool('move')}>
              <Ionicons name="move" size={11} color={figmaColors.buttonPrimaryText} />
            </Pressable>
          </View>
          <View style={[...toolBtn('rotate', activeTool === 'rotate'), styles.transformBtnAccent]} {...rotateButtonPan.panHandlers}>
            <Pressable style={styles.transformBtnInner} onPress={() => setActiveTool('rotate')}>
              <Ionicons name="refresh" size={10} color={figmaColors.white} />
            </Pressable>
          </View>
          <View style={[...toolBtn('scale', activeTool === 'scale'), styles.transformBtnAccent]} {...scaleButtonPan.panHandlers}>
            <Pressable style={styles.transformBtnInner} onPress={() => setActiveTool('scale')}>
              <Ionicons name="scan-outline" size={10} color={figmaColors.white} />
            </Pressable>
          </View>
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
  transformBtnActive: {
    borderColor: figmaColors.accentStrong,
    backgroundColor: figmaColors.navItemActiveBg
  },
  transformBtnAccent: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: figmaColors.accentStrong
  },
  transformBtnInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
