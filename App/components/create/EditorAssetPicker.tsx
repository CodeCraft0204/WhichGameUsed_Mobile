import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType
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
  currentBackgroundKey: PhotoBackgroundKey;
  /** Sidebar inner width — used to size list thumbnails */
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

const TAB_ICONS: Record<AssetTab, keyof typeof Ionicons.glyphMap> = {
  frames: 'easel-outline',
  pins: 'shapes-outline',
  backgrounds: 'color-palette-outline'
};

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
  currentBackgroundKey,
  panelWidth = 148,
  isDragging = false,
  onAssetDragStart,
  onAssetDragMove,
  onAssetDragEnd
}: Props) {
  const [tab, setTab] = useState<AssetTab>('frames');
  const [selected, setSelected] = useState<PickerAsset | null>(frameAssets[0] ?? null);
  const thumbSize = Math.max(44, Math.min(panelWidth - 16, 64));
  const previewSize = Math.max(52, Math.min(panelWidth - 24, 72));

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
      <View style={styles.tabs}>
        {(['frames', 'pins', 'backgrounds'] as AssetTab[]).map((tabKey) => (
          <TabIconButton
            key={tabKey}
            icon={TAB_ICONS[tabKey]}
            active={tab === tabKey}
            accessibilityLabel={tabKey}
            onPress={() => {
              setTab(tabKey);
              if (tabKey === 'frames') setSelected(frameAssets[0] ?? null);
              else if (tabKey === 'pins') setSelected(pinAssets[0] ?? null);
              else setSelected(backgroundAssetForKey(currentBackgroundKey));
            }}
          />
        ))}
      </View>

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
            <Ionicons name="image-outline" size={28} color={figmaColors.grayMuted} />
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

const DRAG_THRESHOLD = 10;

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
  const startPage = useRef({ pageX: 0, pageY: 0 });
  const handlersRef = useRef({ item, onSelect, onDragStart, onDragMove, onDragEnd });
  handlersRef.current = { item, onSelect, onDragStart, onDragMove, onDragEnd };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
        onPanResponderTerminationRequest: () => !dragged.current,
        onPanResponderGrant: (event) => {
          dragged.current = false;
          startPage.current = {
            pageX: event.nativeEvent.pageX,
            pageY: event.nativeEvent.pageY
          };
        },
        onPanResponderMove: (_, gesture) => {
          const { item: currentItem, onDragMove: move, onDragStart: start } = handlersRef.current;
          const pageX = startPage.current.pageX + gesture.dx;
          const pageY = startPage.current.pageY + gesture.dy;
          if (
            !dragged.current &&
            (Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD)
          ) {
            dragged.current = true;
            move({ pageX, pageY });
            start(currentItem);
          }
          if (dragged.current) move({ pageX, pageY });
        },
        onPanResponderRelease: (_, gesture) => {
          const { item: currentItem, onSelect: select, onDragEnd: end } = handlersRef.current;
          const pageX = startPage.current.pageX + gesture.dx;
          const pageY = startPage.current.pageY + gesture.dy;
          if (dragged.current) end({ pageX, pageY });
          else select(currentItem);
          dragged.current = false;
        },
        onPanResponderTerminate: (_, gesture) => {
          const { onDragEnd: end } = handlersRef.current;
          if (dragged.current) {
            end({
              pageX: startPage.current.pageX + gesture.dx,
              pageY: startPage.current.pageY + gesture.dy
            });
          }
          dragged.current = false;
        }
      }),
    []
  );

  return (
    <View
      style={[
        styles.listThumbWrap,
        { width: thumbSize + 8 },
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
            style={styles.listThumbImage}
            resizeMode={item.kind === 'background' ? 'cover' : 'contain'}
          />
        </View>
      ) : (
        <View style={[styles.listThumbPlaceholder, { width: thumbSize, height: thumbSize }]}>
          <Ionicons name="image-outline" size={20} color={figmaColors.grayMuted} />
        </View>
      )}
    </View>
  );
}

function TabIconButton({
  icon,
  active,
  onPress,
  accessibilityLabel
}: {
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? figmaColors.tabTextActive : figmaColors.tabText}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 8
  },
  tabs: {
    flexDirection: 'row',
    gap: 6
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    backgroundColor: figmaColors.creamLight,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabActive: {
    backgroundColor: figmaColors.sepia,
    borderColor: figmaColors.umber
  },
  previewPane: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 8,
    minHeight: 88
  },
  previewImage: {
    backgroundColor: figmaColors.white,
    borderRadius: 8,
    overflow: 'hidden'
  },
  parchmentPreview: {
    backgroundColor: figmaColors.parchment,
    borderWidth: 1,
    borderColor: figmaColors.borderLight
  },
  previewPlaceholder: {
    borderRadius: 8,
    backgroundColor: figmaColors.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listScroll: {
    flex: 1,
    width: '100%'
  },
  listContent: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12
  },
  listThumbWrap: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    padding: 4,
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
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: figmaColors.white
  },
  listThumbImage: {
    width: '100%',
    height: '100%'
  },
  listThumbPlaceholder: {
    borderRadius: 6,
    backgroundColor: figmaColors.white,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
