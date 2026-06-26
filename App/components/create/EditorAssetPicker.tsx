import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ImageSourcePropType,
  type PanResponderGestureState
} from 'react-native';
import {
  photoFrameKeys,
  photoFrameLabels,
  photoFrames,
  photoShapeKeys,
  photoShapeLabels,
  photoShapes,
  type PhotoFrameKey,
  type PhotoShapeKey
} from '@/constants/photoEditorAssets';
import {
  photoBackgroundLabels,
  photoBackgroundPickerKeys,
  photoBackgroundSource,
  type PhotoBackgroundKey
} from '@/constants/photoEditorBackgrounds';
import { figmaColors } from '@/constants/figmaColors';

type AssetTab = 'frames' | 'pins' | 'backgrounds';

export type LibraryAssetTab = AssetTab;

export const LIBRARY_TAB_ORDER: LibraryAssetTab[] = ['frames', 'pins', 'backgrounds'];

export const LIBRARY_TAB_LABELS: Record<LibraryAssetTab, string> = {
  frames: 'Frame',
  pins: 'Pin',
  backgrounds: 'Background'
};

type FrameAsset = { kind: 'frame'; key: PhotoFrameKey; label: string; source: ImageSourcePropType };
type PinAsset = { kind: 'pin'; key: PhotoShapeKey; label: string; source: ImageSourcePropType };
type BackgroundAsset = {
  kind: 'background';
  key: PhotoBackgroundKey;
  label: string;
  source: ImageSourcePropType | null;
};
export type PickerAsset = FrameAsset | PinAsset | BackgroundAsset;

type Props = {
  tab: LibraryAssetTab;
  onTabChange: (tab: LibraryAssetTab) => void;
  currentBackgroundKey: PhotoBackgroundKey;
  /** Inner sidebar width — sizes preview square */
  panelWidth?: number;
  isDragging?: boolean;
  onAssetDragStart: (item: PickerAsset) => void;
  onAssetDragMove: (position: { pageX: number; pageY: number }) => void;
  onAssetDragEnd: (position: { pageX: number; pageY: number }) => void;
};

const frameAssets: FrameAsset[] = photoFrameKeys.map((key) => ({
  kind: 'frame',
  key,
  label: photoFrameLabels[key],
  source: photoFrames[key]
}));

const pinAssets: PinAsset[] = photoShapeKeys.map((key) => ({
  kind: 'pin',
  key,
  label: photoShapeLabels[key],
  source: photoShapes[key]
}));

const backgroundAssets: BackgroundAsset[] = photoBackgroundPickerKeys.map((key) => ({
  kind: 'background',
  key,
  label: photoBackgroundLabels[key],
  source: photoBackgroundSource(key)
}));

function backgroundAssetForKey(key: PhotoBackgroundKey): BackgroundAsset {
  return (
    backgroundAssets.find((asset) => asset.key === key) ?? {
      kind: 'background',
      key: 'parchment',
      label: photoBackgroundLabels.parchment,
      source: null
    }
  );
}

export function EditorAssetPicker({
  tab,
  onTabChange: _onTabChange,
  currentBackgroundKey,
  panelWidth = 72,
  isDragging = false,
  onAssetDragStart,
  onAssetDragMove,
  onAssetDragEnd
}: Props) {
  const [selected, setSelected] = useState<PickerAsset | null>(frameAssets[0] ?? null);
  const thumbSize = 26;
  const previewSize = Math.max(32, panelWidth - 4);

  useEffect(() => {
    if (tab === 'frames') setSelected(frameAssets[0] ?? null);
    else if (tab === 'pins') setSelected(pinAssets[0] ?? null);
    else setSelected(backgroundAssetForKey(currentBackgroundKey));
  }, [tab]);

  useEffect(() => {
    if (tab === 'backgrounds') {
      setSelected(backgroundAssetForKey(currentBackgroundKey));
    }
  }, [currentBackgroundKey, tab]);

  const items =
    tab === 'frames' ? frameAssets : tab === 'pins' ? pinAssets : backgroundAssets;

  const selectItem = (item: PickerAsset) => {
    setSelected(item);
  };

  const isBackgroundTab = tab === 'backgrounds';

  return (
    <View style={styles.root}>
      <View style={styles.previewPane}>
        {selected?.kind === 'background' && !selected.source ? (
          <View
            style={[
              styles.previewImage,
              styles.parchmentPreview,
              { width: previewSize, height: previewSize }
            ]}
          />
        ) : selected?.source ? (
          <Image
            source={selected.source}
            style={[styles.previewImage, { width: previewSize, height: previewSize }]}
            resizeMode={isBackgroundTab ? 'cover' : 'contain'}
          />
        ) : (
          <View style={[styles.previewPlaceholder, { width: previewSize, height: previewSize }]}>
            <Ionicons name="image-outline" size={22} color={figmaColors.grayMuted} />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isDragging}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => {
          const active = selected?.kind === item.kind && selected.key === item.key;
          const isAppliedBackground =
            item.kind === 'background' && item.key === currentBackgroundKey;

          return (
            <DraggableAssetThumb
              key={`${item.kind}-${item.key}`}
              item={item}
              thumbSize={thumbSize}
              active={active}
              isAppliedBackground={isAppliedBackground}
              onSelect={selectItem}
              onDragStart={onAssetDragStart}
              onDragMove={onAssetDragMove}
              onDragEnd={onAssetDragEnd}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const DRAG_THRESHOLD = 8;

function screenPoint(
  gesture: PanResponderGestureState,
  event?: GestureResponderEvent
): { pageX: number; pageY: number } {
  if (Number.isFinite(gesture.moveX) && Number.isFinite(gesture.moveY)) {
    return { pageX: gesture.moveX, pageY: gesture.moveY };
  }
  if (Number.isFinite(gesture.x0) && Number.isFinite(gesture.y0)) {
    return { pageX: gesture.x0 + gesture.dx, pageY: gesture.y0 + gesture.dy };
  }
  if (event) {
    const { pageX, pageY } = event.nativeEvent;
    if (Number.isFinite(pageX) && Number.isFinite(pageY)) {
      return { pageX, pageY };
    }
  }
  return { pageX: 0, pageY: 0 };
}

function DraggableAssetThumb({
  item,
  thumbSize,
  active,
  isAppliedBackground,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd
}: {
  item: PickerAsset;
  thumbSize: number;
  active: boolean;
  isAppliedBackground: boolean;
  onSelect: (item: PickerAsset) => void;
  onDragStart: (item: PickerAsset) => void;
  onDragMove: (position: { pageX: number; pageY: number }) => void;
  onDragEnd: (position: { pageX: number; pageY: number }) => void;
}) {
  const dragged = useRef(false);
  const handlersRef = useRef({ item, onSelect, onDragStart, onDragMove, onDragEnd });
  handlersRef.current = { item, onSelect, onDragStart, onDragMove, onDragEnd };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => dragged.current,
        onPanResponderTerminationRequest: () => !dragged.current,
        onPanResponderGrant: () => {
          dragged.current = false;
        },
        onPanResponderMove: (event, gesture) => {
          const { item: currentItem, onDragMove: move, onDragStart: start } = handlersRef.current;
          const point = screenPoint(gesture, event);
          if (
            !dragged.current &&
            (Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD)
          ) {
            dragged.current = true;
            start(currentItem);
          }
          if (dragged.current) move(point);
        },
        onPanResponderRelease: (event, gesture) => {
          const { item: currentItem, onSelect: select, onDragEnd: end } = handlersRef.current;
          const point = screenPoint(gesture, event);
          if (dragged.current) end(point);
          else select(currentItem);
          dragged.current = false;
        },
        onPanResponderTerminate: (event, gesture) => {
          const { onDragEnd: end } = handlersRef.current;
          if (dragged.current) end(screenPoint(gesture, event));
          dragged.current = false;
        },
        onPanResponderReject: () => {
          dragged.current = false;
        }
      }),
    []
  );

  return (
    <View
      style={[
        styles.listThumbWrap,
        { width: thumbSize + 4 },
        active && styles.listThumbWrapActive,
        isAppliedBackground && styles.listThumbWrapApplied
      ]}
      accessibilityLabel={item.label}
      {...pan.panHandlers}
    >
      {item.kind === 'background' && !item.source ? (
        <View
          style={[
            styles.listThumbClip,
            styles.parchmentPreview,
            { width: thumbSize, height: thumbSize }
          ]}
        />
      ) : item.source ? (
        <View style={[styles.listThumbClip, { width: thumbSize, height: thumbSize }]}>
          <Image
            source={item.source}
            style={{ width: thumbSize, height: thumbSize }}
            resizeMode={item.kind === 'background' ? 'cover' : 'contain'}
          />
        </View>
      ) : (
        <View style={[styles.listThumbPlaceholder, { width: thumbSize, height: thumbSize }]}>
          <Ionicons name="image-outline" size={14} color={figmaColors.grayMuted} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
    gap: 4
  },
  previewPane: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 2,
    paddingVertical: 4
  },
  previewImage: {
    backgroundColor: figmaColors.surfaceMuted,
    borderRadius: 6,
    overflow: 'hidden'
  },
  parchmentPreview: {
    backgroundColor: figmaColors.parchment,
    borderWidth: 1,
    borderColor: figmaColors.borderLight
  },
  previewPlaceholder: {
    borderRadius: 6,
    backgroundColor: figmaColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listScroll: {
    flex: 1,
    minHeight: 0,
    width: '100%'
  },
  listContent: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6
  },
  listThumbWrap: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    padding: 2,
    alignItems: 'center',
    overflow: 'hidden'
  },
  listThumbWrapActive: {
    borderColor: figmaColors.accent,
    backgroundColor: 'transparent'
  },
  listThumbWrapApplied: {
    borderColor: figmaColors.success
  },
  listThumbClip: {
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: figmaColors.surfaceMuted
  },
  listThumbPlaceholder: {
    borderRadius: 3,
    backgroundColor: figmaColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
