import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { photoFrames, photoShapes, photoAssetPreviewBackground, type PhotoFrameKey } from '@/constants/photoEditorAssets';
import { getPhotoFrameInsets } from '@/constants/photoEditorTemplates';
import {
  photoBackgroundSource,
  type PhotoBackgroundKey
} from '@/constants/photoEditorBackgrounds';
import { figmaColors } from '@/constants/figmaColors';

export type BlankLayerKind = 'photo' | 'framed' | 'text' | 'shape';

export type BlankLayer = {
  id: string;
  kind: BlankLayerKind;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Clockwise rotation in degrees. */
  rotation?: number;
  photoUri?: string | null;
  frame?: PhotoFrameKey;
  shape?: keyof typeof photoShapes;
  text?: string;
  fontSize?: number;
  placeholder?: string;
};

export const BLANK_CANVAS_ASPECT = 3 / 4;

type Props = {
  layers: BlankLayer[];
  selectedId: string | null;
  backgroundKey: PhotoBackgroundKey;
  onLayersChange: (layers: BlankLayer[], options?: { transient?: boolean }) => void;
  onSelect: (id: string | null) => void;
  width: number;
  height: number;
  style?: ViewStyle;
};

function createLayerId(): string {
  return `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBlankPhotoLayer(photoUri: string): BlankLayer {
  return {
    id: createLayerId(),
    kind: 'photo',
    left: 22,
    top: 24,
    width: 56,
    height: 42,
    photoUri
  };
}

export function createBlankFramedLayer(frame: PhotoFrameKey, photoUri?: string | null): BlankLayer {
  return {
    id: createLayerId(),
    kind: 'framed',
    left: 18,
    top: 16,
    width: 64,
    height: 52,
    frame,
    photoUri: photoUri ?? null
  };
}

export function createBlankTextLayer(): BlankLayer {
  return {
    id: createLayerId(),
    kind: 'text',
    left: 10,
    top: 72,
    width: 80,
    height: 14,
    text: '',
    fontSize: 16,
    placeholder: 'Add a caption…'
  };
}

export function createBlankShapeLayer(shape: keyof typeof photoShapes): BlankLayer {
  return {
    id: createLayerId(),
    kind: 'shape',
    left: 38,
    top: 38,
    width: 24,
    height: 24,
    shape
  };
}

export const BlankPhotoEditorCanvas = React.forwardRef<View, Props>(function BlankPhotoEditorCanvas(
  { layers, selectedId, backgroundKey, onLayersChange, onSelect, width, height, style },
  ref
) {
  const uiScale = Math.min(width, height) / 360;
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const canvasOriginRef = useRef({ x: 0, y: 0 });
  const backgroundSource = photoBackgroundSource(backgroundKey);

  const syncCanvasOrigin = useCallback(() => {
    if (typeof ref === 'object' && ref?.current) {
      ref.current.measureInWindow((x, y) => {
        canvasOriginRef.current = { x, y };
      });
    }
  }, [ref]);

  const updateLayer = useCallback(
    (id: string, patch: Partial<BlankLayer>, transient = true) => {
      const next = layersRef.current.map((layer) =>
        layer.id === id ? { ...layer, ...patch } : layer
      );
      layersRef.current = next;
      onLayersChange(next, { transient });
    },
    [onLayersChange]
  );

  const commitLayers = useCallback(() => {
    onLayersChange(layersRef.current, { transient: false });
  }, [onLayersChange]);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={syncCanvasOrigin}
      style={[styles.canvas, { width, height }, style]}
    >
      <View style={[StyleSheet.absoluteFill, styles.canvasUnderlay]} pointerEvents="none" />
      {backgroundSource ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            key={backgroundKey}
            source={backgroundSource}
            style={[StyleSheet.absoluteFill, { width, height }]}
            resizeMode="cover"
          />
        </View>
      ) : null}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => onSelect(null)} />
      {layers.map((layer) => (
        <BlankLayerView
          key={layer.id}
          layer={layer}
          selected={layer.id === selectedId}
          uiScale={uiScale}
          canvasW={width}
          canvasH={height}
          getCanvasOrigin={() => canvasOriginRef.current}
          onSelect={onSelect}
          onChange={updateLayer}
          onCommit={commitLayers}
        />
      ))}
    </View>
  );
});

type LayerViewProps = {
  layer: BlankLayer;
  selected: boolean;
  uiScale: number;
  canvasW: number;
  canvasH: number;
  getCanvasOrigin: () => { x: number; y: number };
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<BlankLayer>, transient?: boolean) => void;
  onCommit: () => void;
};

function layerCenterOnScreen(
  layer: BlankLayer,
  canvasOrigin: { x: number; y: number },
  canvasW: number,
  canvasH: number
) {
  return {
    x: canvasOrigin.x + ((layer.left + layer.width / 2) / 100) * canvasW,
    y: canvasOrigin.y + ((layer.top + layer.height / 2) / 100) * canvasH
  };
}

function angleFromPoint(centerX: number, centerY: number, pageX: number, pageY: number) {
  return Math.atan2(pageY - centerY, pageX - centerX);
}

function photoClipInsetsForFrame(frame: PhotoFrameKey): Pick<ViewStyle, 'top' | 'left' | 'right' | 'bottom'> {
  const insets = getPhotoFrameInsets(frame);
  return {
    top: `${insets.insetTop}%`,
    left: `${insets.insetLeft}%`,
    right: `${insets.insetRight}%`,
    bottom: `${insets.insetBottom}%`
  };
}

function BlankLayerView({
  layer,
  selected,
  uiScale,
  canvasW,
  canvasH,
  getCanvasOrigin,
  onSelect,
  onChange,
  onCommit
}: LayerViewProps) {
  const layerRef = useRef(layer);
  layerRef.current = layer;

  const origin = useRef({ left: layer.left, top: layer.top, width: layer.width, height: layer.height });
  const rotateOrigin = useRef({ startRotation: 0, startAngle: 0, centerX: 0, centerY: 0 });

  const handlersRef = useRef({
    onSelect,
    onChange,
    onCommit,
    getCanvasOrigin,
    canvasW,
    canvasH
  });
  handlersRef.current = { onSelect, onChange, onCommit, getCanvasOrigin, canvasW, canvasH };

  const canRotate = layer.kind === 'framed' || layer.kind === 'shape';

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const current = layerRef.current;
        handlersRef.current.onSelect(current.id);
        origin.current = {
          left: current.left,
          top: current.top,
          width: current.width,
          height: current.height
        };
      },
      onPanResponderMove: (_, gesture) => {
        const { canvasW: w, canvasH: h, onChange: change } = handlersRef.current;
        const dxPct = (gesture.dx / w) * 100;
        const dyPct = (gesture.dy / h) * 100;
        change(
          layerRef.current.id,
          {
            left: origin.current.left + dxPct,
            top: origin.current.top + dyPct
          },
          true
        );
      },
      onPanResponderRelease: () => handlersRef.current.onCommit(),
      onPanResponderTerminate: () => handlersRef.current.onCommit()
    })
  ).current;

  const resizePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const current = layerRef.current;
        handlersRef.current.onSelect(current.id);
        origin.current = {
          left: current.left,
          top: current.top,
          width: current.width,
          height: current.height
        };
      },
      onPanResponderMove: (_, gesture) => {
        const { canvasW: w, canvasH: h, onChange: change } = handlersRef.current;
        const dwPct = (gesture.dx / w) * 100;
        const dhPct = (gesture.dy / h) * 100;
        change(
          layerRef.current.id,
          {
            width: Math.max(12, origin.current.width + dwPct),
            height: Math.max(10, origin.current.height + dhPct)
          },
          true
        );
      },
      onPanResponderRelease: () => handlersRef.current.onCommit(),
      onPanResponderTerminate: () => handlersRef.current.onCommit()
    })
  ).current;

  const rotatePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        const current = layerRef.current;
        const { getCanvasOrigin: canvasOrigin, canvasW: w, canvasH: h, onSelect: select } =
          handlersRef.current;
        select(current.id);
        const center = layerCenterOnScreen(current, canvasOrigin(), w, h);
        const { pageX, pageY } = event.nativeEvent;
        rotateOrigin.current = {
          startRotation: current.rotation ?? 0,
          startAngle: angleFromPoint(center.x, center.y, pageX, pageY),
          centerX: center.x,
          centerY: center.y
        };
      },
      onPanResponderMove: (event) => {
        const { startRotation, startAngle, centerX, centerY } = rotateOrigin.current;
        const { pageX, pageY } = event.nativeEvent;
        const angle = angleFromPoint(centerX, centerY, pageX, pageY);
        const deltaDeg = ((angle - startAngle) * 180) / Math.PI;
        handlersRef.current.onChange(
          layerRef.current.id,
          { rotation: startRotation + deltaDeg },
          true
        );
      },
      onPanResponderRelease: () => handlersRef.current.onCommit(),
      onPanResponderTerminate: () => handlersRef.current.onCommit()
    })
  ).current;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(layer.id, { photoUri: result.assets[0].uri }, false);
    }
  };

  const photoClipInsets: Pick<ViewStyle, 'top' | 'left' | 'right' | 'bottom'> =
    layer.kind === 'framed' && layer.frame
      ? photoClipInsetsForFrame(layer.frame)
      : { top: 0, left: 0, right: 0, bottom: 0 };

  const rotation = layer.rotation ?? 0;

  return (
    <View
      style={[
        styles.layer,
        {
          left: `${layer.left}%`,
          top: `${layer.top}%`,
          width: `${layer.width}%`,
          height: `${layer.height}%`,
          transform: [{ rotate: `${rotation}deg` }]
        },
        selected && styles.layerSelected
      ]}
    >
      {layer.kind === 'text' ? (
        <TextInput
          style={[styles.textLayer, { fontSize: (layer.fontSize ?? 16) * uiScale }]}
          value={layer.text ?? ''}
          onChangeText={(text) => onChange(layer.id, { text }, true)}
          onBlur={onCommit}
          placeholder={layer.placeholder}
          placeholderTextColor={figmaColors.textMuted}
          multiline
          onFocus={() => onSelect(layer.id)}
        />
      ) : layer.kind === 'shape' && layer.shape ? (
        <Image source={photoShapes[layer.shape]} style={styles.shapeImage} resizeMode="contain" />
      ) : (
        <Pressable style={styles.mediaSlot} onPress={() => void pickPhoto()}>
          <View style={[styles.photoClip, photoClipInsets]}>
            {layer.photoUri ? (
              <Image source={{ uri: layer.photoUri }} style={styles.photo} resizeMode="cover" />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="image-outline" size={20 * uiScale} color={figmaColors.gray} />
                <Text style={[styles.placeholderText, { fontSize: 10 * uiScale }]}>Tap to add</Text>
              </View>
            )}
          </View>
          {layer.kind === 'framed' && layer.frame ? (
            <View pointerEvents="none" style={styles.frameOverlay}>
              <Image
                source={photoFrames[layer.frame]}
                style={styles.frameImage}
                resizeMode="stretch"
              />
            </View>
          ) : null}
        </Pressable>
      )}

      {selected ? (
        <>
          <View style={[styles.dragHandle, { transform: [{ scale: uiScale }] }]} {...pan.panHandlers}>
            <Ionicons name="move" size={14} color={figmaColors.buttonPrimaryText} />
          </View>
          <View style={[styles.resizeHandle, { transform: [{ scale: uiScale }] }]} {...resizePan.panHandlers} />
          {canRotate ? (
            <View
              style={[styles.rotateHandle, { transform: [{ scale: uiScale }] }]}
              {...rotatePan.panHandlers}
            >
              <Ionicons name="refresh" size={11} color={figmaColors.white} />
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: figmaColors.parchment,
    overflow: 'hidden'
  },
  canvasUnderlay: {
    backgroundColor: figmaColors.creamLight
  },
  layer: {
    position: 'absolute'
  },
  layerSelected: {
    borderWidth: 1.5,
    borderColor: figmaColors.accent,
    borderRadius: 4
  },
  mediaSlot: {
    flex: 1
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
    gap: 4
  },
  placeholderText: {
    fontFamily: appFonts.body,
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
  shapeImage: {
    width: '100%',
    height: '100%'
  },
  textLayer: {
    flex: 1,
    fontFamily: appFonts.accent,
    color: figmaColors.charcoal,
    padding: 2,
    textAlignVertical: 'top'
  },
  dragHandle: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 20,
    borderRadius: 10,
    backgroundColor: figmaColors.buttonPrimaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  resizeHandle: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: figmaColors.accentStrong,
    borderWidth: 2,
    borderColor: figmaColors.white,
    zIndex: 2
  },
  rotateHandle: {
    position: 'absolute',
    left: -8,
    bottom: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: figmaColors.accentStrong,
    borderWidth: 2,
    borderColor: figmaColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  }
});
