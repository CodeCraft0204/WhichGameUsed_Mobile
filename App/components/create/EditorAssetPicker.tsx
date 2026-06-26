import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
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
  onAddFrame,
  onAddPin,
  currentBackgroundKey,
  onApplyBackground
}: Props) {
  const [tab, setTab] = useState<AssetTab>('frames');
  const [selected, setSelected] = useState<PickerAsset | null>(frameAssets[0] ?? null);

  useEffect(() => {
    if (tab === 'backgrounds') {
      setSelected(backgroundAssetForKey(currentBackgroundKey));
    }
  }, [currentBackgroundKey, tab]);

  const items =
    tab === 'frames' ? frameAssets : tab === 'pins' ? pinAssets : backgroundAssets;

  const selectItem = (item: PickerAsset) => {
    setSelected(item);
    if (item.kind === 'background') {
      onApplyBackground(item.key);
    }
  };

  const applySelected = () => {
    if (!selected) return;
    if (selected.kind === 'frame') onAddFrame(selected.key);
    else if (selected.kind === 'pin') onAddPin(selected.key);
    else onApplyBackground(selected.key);
  };

  const previewLabel = selected?.label ?? 'Select an item to preview';
  const isBackgroundTab = tab === 'backgrounds';
  const isCurrentBackground =
    selected?.kind === 'background' && selected.key === currentBackgroundKey;

  const previewHint = isBackgroundTab
    ? 'Sets the canvas backdrop behind your layers.'
    : tab === 'frames'
      ? 'Adds an empty frame you can fill and move on the canvas.'
      : 'Adds a decorative pin you can drag and resize.';

  const actionLabel = isBackgroundTab
    ? isCurrentBackground
      ? 'Applied'
      : 'Apply background'
    : 'Add to canvas';

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <TabButton
          label="Frames"
          active={tab === 'frames'}
          onPress={() => {
            setTab('frames');
            setSelected(frameAssets[0] ?? null);
          }}
        />
        <TabButton
          label="Pins"
          active={tab === 'pins'}
          onPress={() => {
            setTab('pins');
            setSelected(pinAssets[0] ?? null);
          }}
        />
        <TabButton
          label="Backgrounds"
          active={tab === 'backgrounds'}
          onPress={() => {
            setTab('backgrounds');
            setSelected(backgroundAssetForKey(currentBackgroundKey));
          }}
        />
      </View>

      <View style={styles.previewPane}>
        {selected?.kind === 'background' && !selected.source ? (
          <View style={[styles.previewImage, styles.parchmentPreview]} />
        ) : selected?.source ? (
          <Image
            source={selected.source}
            style={styles.previewImage}
            resizeMode={isBackgroundTab ? 'cover' : 'contain'}
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="eye-outline" size={28} color={figmaColors.grayMuted} />
          </View>
        )}
        <View style={styles.previewCopy}>
          <Text style={styles.previewTitle} numberOfLines={2}>
            {previewLabel}
          </Text>
          <Text style={styles.previewHint}>{previewHint}</Text>
          <Pressable
            style={[
              styles.addButton,
              !selected && styles.addButtonDisabled,
              isCurrentBackground && isBackgroundTab && styles.addButtonApplied
            ]}
            onPress={applySelected}
            disabled={!selected}
          >
            <Ionicons
              name={isBackgroundTab ? 'color-palette-outline' : 'add-circle-outline'}
              size={16}
              color={figmaColors.buttonPrimaryText}
            />
            <Text style={styles.addButtonText}>{actionLabel}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbRow}
      >
        {items.map((item) => {
          const active = selected?.kind === item.kind && selected.key === item.key;
          const isAppliedBackground =
            item.kind === 'background' && item.key === currentBackgroundKey;

          return (
            <Pressable
              key={`${item.kind}-${item.key}`}
              style={[
                styles.thumbCard,
                active && styles.thumbCardActive,
                isAppliedBackground && styles.thumbCardApplied
              ]}
              onPress={() => selectItem(item)}
            >
              {item.kind === 'background' && !item.source ? (
                <View style={[styles.thumbImage, styles.parchmentPreview]} />
              ) : item.source ? (
                <Image
                  source={item.source}
                  style={styles.thumbImage}
                  resizeMode={item.kind === 'background' ? 'cover' : 'contain'}
                />
              ) : null}
              <Text style={styles.thumbLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    paddingTop: 8
  },
  tabs: {
    flexDirection: 'row',
    gap: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    backgroundColor: figmaColors.inputBg,
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: figmaColors.tabActiveBg,
    borderColor: figmaColors.tabActiveBorder
  },
  tabText: {
    fontFamily: appFonts.body,
    fontSize: 13,
    color: figmaColors.tabText
  },
  tabTextActive: {
    color: figmaColors.tabTextActive
  },
  previewPane: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    borderRadius: 12,
    backgroundColor: figmaColors.inputBg,
    padding: 10,
    minHeight: 108
  },
  previewImage: {
    width: 88,
    height: 88,
    backgroundColor: figmaColors.surfaceMuted,
    borderRadius: 8,
    overflow: 'hidden'
  },
  parchmentPreview: {
    backgroundColor: figmaColors.parchment,
    borderWidth: 1,
    borderColor: figmaColors.borderLight
  },
  previewPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: figmaColors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewCopy: {
    flex: 1,
    justifyContent: 'center',
    gap: 4
  },
  previewTitle: {
    fontFamily: appFonts.display,
    fontSize: 16,
    color: figmaColors.charcoal
  },
  previewHint: {
    fontFamily: appFonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: figmaColors.gray
  },
  addButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: figmaColors.buttonPrimaryBg
  },
  addButtonDisabled: {
    opacity: 0.45
  },
  addButtonApplied: {
    backgroundColor: figmaColors.success
  },
  addButtonText: {
    fontFamily: appFonts.body,
    fontSize: 12,
    color: figmaColors.buttonPrimaryText
  },
  thumbRow: {
    gap: 8,
    paddingBottom: 4
  },
  thumbCard: {
    width: 76,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    borderRadius: 10,
    backgroundColor: figmaColors.inputBg,
    padding: 6,
    alignItems: 'center',
    gap: 4
  },
  thumbCardActive: {
    borderColor: figmaColors.accent,
    backgroundColor: figmaColors.surfaceElevated
  },
  thumbCardApplied: {
    borderColor: figmaColors.success
  },
  thumbImage: {
    width: 56,
    height: 56,
    borderRadius: 6,
    overflow: 'hidden'
  },
  thumbLabel: {
    fontFamily: appFonts.body,
    fontSize: 10,
    lineHeight: 13,
    color: figmaColors.charcoal,
    textAlign: 'center'
  }
});
