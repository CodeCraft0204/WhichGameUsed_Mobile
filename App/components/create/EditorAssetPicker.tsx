import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
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
type PickerAsset = FrameAsset | PinAsset | BackgroundAsset;

type Props = {
  onAddFrame: (frame: PhotoFrameKey) => void;
  onAddPin: (shape: PhotoShapeKey) => void;
  currentBackgroundKey: PhotoBackgroundKey;
  onApplyBackground: (background: PhotoBackgroundKey) => void;
  /** Sidebar inner width — used to size list thumbnails */
  panelWidth?: number;
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
  onAddFrame,
  onAddPin,
  currentBackgroundKey,
  onApplyBackground,
  panelWidth = 148
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
    if (item.kind === 'background') onApplyBackground(item.key);
    else if (item.kind === 'frame') onAddFrame(item.key);
    else onAddPin(item.key);
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
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) => {
          const active = selected?.kind === item.kind && selected.key === item.key;
          const isAppliedBackground =
            item.kind === 'background' && item.key === currentBackgroundKey;

          return (
            <Pressable
              key={`${item.kind}-${item.key}`}
              style={[
                styles.listThumbWrap,
                { width: thumbSize + 8 },
                active && styles.listThumbWrapActive,
                isAppliedBackground && styles.listThumbWrapApplied
              ]}
              onPress={() => selectItem(item)}
              accessibilityLabel={item.label}
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
                <View
                  style={[styles.listThumbPlaceholder, { width: thumbSize, height: thumbSize }]}
                >
                  <Ionicons name="image-outline" size={20} color={figmaColors.grayMuted} />
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
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
    borderColor: 'rgba(139, 115, 85, 0.28)',
    backgroundColor: 'rgba(253, 249, 242, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabActive: {
    backgroundColor: 'rgba(74, 64, 53, 0.82)',
    borderColor: 'rgba(61, 52, 41, 0.65)'
  },
  previewPane: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.28)',
    borderRadius: 10,
    backgroundColor: 'rgba(253, 249, 242, 0.45)',
    padding: 8,
    minHeight: 88
  },
  previewImage: {
    backgroundColor: figmaColors.surfaceMuted,
    borderRadius: 8,
    overflow: 'hidden'
  },
  parchmentPreview: {
    backgroundColor: figmaColors.parchment,
    borderWidth: 1,
    borderColor: 'rgba(139, 115, 85, 0.28)'
  },
  previewPlaceholder: {
    borderRadius: 8,
    backgroundColor: 'rgba(237, 228, 212, 0.65)',
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
    borderColor: 'rgba(139, 115, 85, 0.28)',
    backgroundColor: 'rgba(253, 249, 242, 0.45)',
    padding: 4,
    alignItems: 'center',
    overflow: 'hidden'
  },
  listThumbWrapActive: {
    borderColor: figmaColors.accent,
    backgroundColor: 'rgba(247, 241, 228, 0.72)'
  },
  listThumbWrapApplied: {
    borderColor: figmaColors.success
  },
  listThumbClip: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: figmaColors.surfaceMuted
  },
  listThumbImage: {
    width: '100%',
    height: '100%'
  },
  listThumbPlaceholder: {
    borderRadius: 6,
    backgroundColor: 'rgba(237, 228, 212, 0.65)',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
