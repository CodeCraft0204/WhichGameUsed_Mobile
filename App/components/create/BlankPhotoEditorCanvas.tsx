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
import { photoFrames, photoShapes, type PhotoFrameKey } from '@/constants/photoEditorAssets';
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
  const backgroundSource = photoBackgroundSource(backgroundKey);

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
      style={[styles.canvas, { width, height }, style]}
    >
      <View style={[StyleSheet.absoluteFill, styles.canvasUnderlay]} pointerEvents="none" />
      {backgroundSource ? (
        <Image
          key={backgroundKey}
          source={backgroundSource}
          style={[StyleSheet.absoluteFill, { width, height }]}
          resizeMode="cover"
          pointerEvents="none"
        />
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
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<BlankLayer>, transient?: boolean) => void;
  onCommit: () => void;
};

function BlankLayerView({
  layer,
  selected,
  uiScale,
  canvasW,
  canvasH,
  onSelect,
  onChange,
  onCommit
}: LayerViewProps) {
  const origin = useRef({ left: layer.left, top: layer.top, width: layer.width, height: layer.height });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        onSelect(layer.id);
        origin.current = {
          left: layer.left,
          top: layer.top,
          width: layer.width,
          height: layer.height
        };
      },
      onPanResponderMove: (_, gesture) => {
        const dxPct = (gesture.dx / canvasW) * 100;
        const dyPct = (gesture.dy / canvasH) * 100;
        onChange(
          layer.id,
          {
            left: origin.current.left + dxPct,
            top: origin.current.top + dyPct
          },
          true
        );
      },
      onPanResponderRelease: onCommit,
      onPanResponderTerminate: onCommit
    })
  ).current;

  const resizePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        onSelect(layer.id);
        origin.current = {
          left: layer.left,
          top: layer.top,
          width: layer.width,
          height: layer.height
        };
      },
      onPanResponderMove: (_, gesture) => {
        const dwPct = (gesture.dx / canvasW) * 100;
        const dhPct = (gesture.dy / canvasH) * 100;
        onChange(
          layer.id,
          {
            width: Math.max(12, origin.current.width + dwPct),
            height: Math.max(10, origin.current.height + dhPct)
          },
          true
        );
      },
      onPanResponderRelease: onCommit,
      onPanResponderTerminate: onCommit
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

  const framedInsets =
    layer.kind === 'framed'
      ? { top: '8%', left: '10%', right: '10%', bottom: '18%' }
      : { top: 0, left: 0, right: 0, bottom: 0 };

  return (
    <View
      style={[
        styles.layer,
        {
          left: `${layer.left}%`,
          top: `${layer.top}%`,
          width: `${layer.width}%`,
          height: `${layer.height}%`
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
          <View style={[styles.photoClip, framedInsets]}>
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
            <Image
              source={photoFrames[layer.frame]}
              style={styles.frameOverlay}
              resizeMode="stretch"
              pointerEvents="none"
            />
          ) : null}
        </Pressable>
      )}

      {selected ? (
        <>
          <View style={[styles.dragHandle, { transform: [{ scale: uiScale }] }]} {...pan.panHandlers}>
            <Ionicons name="move" size={14} color={figmaColors.buttonPrimaryText} />
          </View>
          <View style={[styles.resizeHandle, { transform: [{ scale: uiScale }] }]} {...resizePan.panHandlers} />
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
    backgroundColor: figmaColors.inputBg
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
  }
});
