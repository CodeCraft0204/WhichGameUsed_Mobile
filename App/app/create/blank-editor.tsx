import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type View as ViewType
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import {
  BlankPhotoEditorCanvas,
  createBlankFramedLayer,
  createBlankPhotoLayer,
  createBlankShapeLayer,
  createBlankTextLayer,
  type BlankLayer
} from '@/components/create/BlankPhotoEditorCanvas';
import {
  EditorAssetPicker,
  LIBRARY_TAB_LABELS,
  LIBRARY_TAB_ORDER,
  type LibraryAssetTab,
  type PickerAsset
} from '@/components/create/EditorAssetPicker';
import { appFonts } from '@/constants/appFonts';
import { editorCopy } from '@/constants/createContent';
import { BLANK_TEMPLATE_ID } from '@/constants/photoEditorTemplates';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useBlankEditorHistory } from '@/hooks/useBlankEditorHistory';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { captureEditorCanvas } from '@/lib/capture-editor-canvas';
import { submitContentCreation } from '@/lib/content-submissions';

function textFromLayers(layers: BlankLayer[]): { title: string; body: string } {
  const texts = layers
    .filter((layer) => layer.kind === 'text' && layer.text?.trim())
    .map((layer) => layer.text!.trim());
  if (texts.length === 0) return { title: '', body: '' };
  return { title: texts[0], body: texts.slice(1).join('\n') };
}

function clampPercent(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function layerAtDropPoint(
  layer: BlankLayer,
  canvasW: number,
  canvasH: number,
  pageX: number,
  pageY: number,
  canvasX: number,
  canvasY: number
): BlankLayer {
  const relX = pageX - canvasX;
  const relY = pageY - canvasY;
  const centerLeft = (relX / canvasW) * 100;
  const centerTop = (relY / canvasH) * 100;
  return {
    ...layer,
    left: clampPercent(centerLeft - layer.width / 2, 100 - layer.width),
    top: clampPercent(centerTop - layer.height / 2, 100 - layer.height)
  };
}

export default function CreateBlankEditorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ linkedCardKey?: string }>();
  const linkedCardId =
    typeof params.linkedCardKey === 'string' && params.linkedCardKey.length > 0
      ? params.linkedCardKey
      : null;

  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canvasRef = useRef<ViewType>(null);
  const canvasStageRef = useRef<ViewType>(null);
  const editorBodyRef = useRef<ViewType>(null);
  const draggingAssetRef = useRef<PickerAsset | null>(null);
  const canvasBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const editorBodyOffsetRef = useRef({ x: 0, y: 0 });

  const {
    layers,
    backgroundKey,
    commitLayers,
    setLayersTransient,
    setBackgroundKey,
    undo,
    redo,
    canUndo,
    canRedo
  } = useBlankEditorHistory();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [canvasArea, setCanvasArea] = useState({ width: 0, height: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [libraryTab, setLibraryTab] = useState<LibraryAssetTab>('frames');
  const [libraryMenuOpen, setLibraryMenuOpen] = useState(false);
  const [draggingAsset, setDraggingAsset] = useState<PickerAsset | null>(null);
  const [dragPosition, setDragPosition] = useState({ pageX: 0, pageY: 0 });
  const { width: screenWidth } = useWindowDimensions();
  const sidebarWidth = Math.min(Math.max(screenWidth * 0.2, 72), 84);

  useEffect(() => {
    if (selectedId && !layers.some((layer) => layer.id === selectedId)) {
      setSelectedId(null);
    }
  }, [layers, selectedId]);

  const hasPhoto = layers.some(
    (layer) => (layer.kind === 'photo' || layer.kind === 'framed') && layer.photoUri
  );

  const handleCanvasAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasArea((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
    requestAnimationFrame(() => {
      canvasStageRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
        if (measuredWidth > 0 && measuredHeight > 0) {
          canvasBoundsRef.current = { x, y, width: measuredWidth, height: measuredHeight };
        }
      });
    });
  }, []);

  const handleLayersChange = useCallback(
    (next: BlankLayer[], options?: { transient?: boolean }) => {
      if (options?.transient) setLayersTransient(next);
      else commitLayers(next);
    },
    [commitLayers, setLayersTransient]
  );

  const layersRef = useRef(layers);
  layersRef.current = layers;

  const addLayer = useCallback(
    (layer: BlankLayer) => {
      commitLayers([...layersRef.current, layer]);
      setSelectedId(layer.id);
    },
    [commitLayers]
  );

  const addPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9
    });
    if (result.canceled || !result.assets[0]?.uri) return;
    addLayer(createBlankPhotoLayer(result.assets[0].uri));
  };

  const syncEditorBodyOffset = useCallback(() => {
    editorBodyRef.current?.measureInWindow((x, y) => {
      editorBodyOffsetRef.current = { x, y };
    });
  }, []);

  const applyLibraryAssetAt = useCallback(
    (asset: PickerAsset, drop: { pageX: number; pageY: number }) => {
      const applyWithBounds = (canvasX: number, canvasY: number, canvasW: number, canvasH: number) => {
        if (
          drop.pageX < canvasX ||
          drop.pageX > canvasX + canvasW ||
          drop.pageY < canvasY ||
          drop.pageY > canvasY + canvasH
        ) {
          return;
        }

        if (asset.kind === 'background') {
          setBackgroundKey(asset.key);
          return;
        }

        const layer =
          asset.kind === 'frame'
            ? createBlankFramedLayer(asset.key, null)
            : createBlankShapeLayer(asset.key);

        addLayer(
          layerAtDropPoint(
            layer,
            canvasW,
            canvasH,
            drop.pageX,
            drop.pageY,
            canvasX,
            canvasY
          )
        );
      };

      const cached = canvasBoundsRef.current;
      if (cached.width > 0 && cached.height > 0) {
        applyWithBounds(cached.x, cached.y, cached.width, cached.height);
        return;
      }

      canvasStageRef.current?.measureInWindow((canvasX, canvasY, canvasW, canvasH) => {
        if (canvasW > 0 && canvasH > 0) {
          canvasBoundsRef.current = { x: canvasX, y: canvasY, width: canvasW, height: canvasH };
        }
        applyWithBounds(canvasX, canvasY, canvasW, canvasH);
      });
    },
    [addLayer, setBackgroundKey]
  );

  const handleAssetDragStart = useCallback(
    (asset: PickerAsset) => {
      syncEditorBodyOffset();
      canvasStageRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          canvasBoundsRef.current = { x, y, width, height };
        }
      });
      draggingAssetRef.current = asset;
      setDraggingAsset(asset);
    },
    [syncEditorBodyOffset]
  );

  const handleAssetDragMove = useCallback(
    (position: { pageX: number; pageY: number }) => {
      setDragPosition(position);
    },
    []
  );

  const handleAssetDragEnd = useCallback(
    (position: { pageX: number; pageY: number }) => {
      const asset = draggingAssetRef.current;
      draggingAssetRef.current = null;
      setDraggingAsset(null);
      if (!asset) return;

      canvasStageRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          canvasBoundsRef.current = { x, y, width, height };
        }
        applyLibraryAssetAt(asset, position);
      });
    },
    [applyLibraryAssetAt]
  );

  const addText = () => {
    addLayer(createBlankTextLayer());
  };

  const removeSelected = () => {
    if (!selectedId) return;
    commitLayers(layers.filter((layer) => layer.id !== selectedId));
    setSelectedId(null);
  };

  const handleLibraryPress = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
      setLibraryMenuOpen(false);
      return;
    }
    setLibraryMenuOpen(true);
  };

  const handleLibraryTabSelect = (tab: LibraryAssetTab) => {
    setLibraryTab(tab);
    setLibraryMenuOpen(false);
    setSidebarOpen(true);
  };

  const onSubmit = async () => {
    if (!user) {
      router.replace('/sign-in/sign-in');
      return;
    }
    if (!hasPhoto) {
      setError(editorCopy.needPhoto);
      return;
    }
    if (!canvasRef.current) return;

    const { title, body } = textFromLayers(layers);
    setBusy(true);
    setError(null);
    try {
      const uri = await captureEditorCanvas(canvasRef);
      const { submissionId, error: submitError } = await submitContentCreation({
        templateId: BLANK_TEMPLATE_ID,
        title,
        body,
        imageUri: uri,
        linkedCardId
      });
      setBusy(false);
      if (submitError || !submissionId) {
        setError(submitError ?? 'Submit failed.');
        return;
      }
      setDone(true);
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : 'Could not export image.');
    }
  };

  if (done) {
    return (
      <View style={styles.doneWrap}>
        <Text style={styles.doneTitle}>{editorCopy.successTitle}</Text>
        <Text style={styles.doneBody}>{editorCopy.successBody}</Text>
        <AuthPrimaryButton label={editorCopy.createAnother} onPress={() => router.replace('/create/create')} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.topBarButton}>
          <Text style={styles.backLink}>{editorCopy.back}</Text>
        </Pressable>
        <View style={styles.historyGroup}>
          <IconButton icon="arrow-undo" label="Undo" onPress={undo} disabled={!canUndo} />
          <IconButton icon="arrow-redo" label="Redo" onPress={redo} disabled={!canRedo} />
        </View>
        <Pressable
          style={[styles.submitChip, busy && styles.submitChipDisabled]}
          onPress={() => void onSubmit()}
          disabled={busy}
        >
          <Text style={styles.submitChipText}>{busy ? '…' : 'Submit'}</Text>
        </Pressable>
      </View>

      <View ref={editorBodyRef} style={styles.editorBody} onLayout={syncEditorBodyOffset}>
        <View ref={canvasStageRef} style={styles.canvasStage} onLayout={handleCanvasAreaLayout}>
          {canvasArea.width > 0 && canvasArea.height > 0 ? (
            <BlankPhotoEditorCanvas
              ref={canvasRef}
              layers={layers}
              selectedId={selectedId}
              backgroundKey={backgroundKey}
              onLayersChange={handleLayersChange}
              onSelect={setSelectedId}
              width={canvasArea.width}
              height={canvasArea.height}
              style={styles.canvasFill}
            />
          ) : null}
        </View>

        {sidebarOpen ? (
          <View
            style={[styles.sidebarOverlay, { width: sidebarWidth }]}
            pointerEvents="box-none"
          >
            <View style={styles.sidebarPanel} pointerEvents="auto">
              <EditorAssetPicker
                tab={libraryTab}
                onTabChange={setLibraryTab}
                currentBackgroundKey={backgroundKey}
                panelWidth={sidebarWidth - s(8)}
                isDragging={draggingAsset !== null}
                onAssetDragStart={handleAssetDragStart}
                onAssetDragMove={handleAssetDragMove}
                onAssetDragEnd={handleAssetDragEnd}
              />
            </View>
          </View>
        ) : null}

        {draggingAsset ? (
          <View style={styles.dragGhostLayer} pointerEvents="none">
            <View
              style={[
                styles.dragGhost,
                {
                  left: dragPosition.pageX - editorBodyOffsetRef.current.x - 16,
                  top: dragPosition.pageY - editorBodyOffsetRef.current.y - 16
                }
              ]}
            >
              {draggingAsset.kind === 'background' && !draggingAsset.source ? (
                <View style={[styles.dragGhostImage, styles.dragGhostParchment]} />
              ) : draggingAsset.source ? (
                <Image
                  source={draggingAsset.source}
                  style={styles.dragGhostImage}
                  resizeMode={draggingAsset.kind === 'background' ? 'cover' : 'contain'}
                />
              ) : (
                <View style={styles.dragGhostImage}>
                  <Ionicons name="image-outline" size={24} color={figmaColors.grayMuted} />
                </View>
              )}
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.quickToolbar}>
          <ToolbarButton icon="image-outline" label="Photo" onPress={() => void addPhoto()} />
          <ToolbarButton
            icon="albums-outline"
            label="Library"
            onPress={handleLibraryPress}
            active={sidebarOpen}
          />
          <ToolbarButton icon="text-outline" label="Text" onPress={addText} />
          <ToolbarButton
            icon="trash-outline"
            label="Delete"
            onPress={removeSelected}
            disabled={!selectedId}
          />
        </View>

        {error ? <AuthErrorBanner message={error} /> : null}
        {busy ? <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} /> : null}
      </View>

      <LibraryAssetTypeMenu
        visible={libraryMenuOpen}
        selectedTab={libraryTab}
        bottomInset={Math.max(insets.bottom, 8)}
        onSelect={handleLibraryTabSelect}
        onClose={() => setLibraryMenuOpen(false)}
      />
    </View>
  );
}

function LibraryAssetTypeMenu({
  visible,
  selectedTab,
  bottomInset,
  onSelect,
  onClose
}: {
  visible: boolean;
  selectedTab: LibraryAssetTab;
  bottomInset: number;
  onSelect: (tab: LibraryAssetTab) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={libraryMenuStyles.backdrop} onPress={onClose} />
      <View
        style={[libraryMenuStyles.anchor, { paddingBottom: bottomInset + 72 }]}
        pointerEvents="box-none"
      >
        <View style={libraryMenuStyles.menu}>
          {LIBRARY_TAB_ORDER.map((tab) => {
            const active = tab === selectedTab;
            return (
              <Pressable
                key={tab}
                style={[libraryMenuStyles.option, active && libraryMenuStyles.optionActive]}
                onPress={() => onSelect(tab)}
              >
                <Text style={[libraryMenuStyles.optionText, active && libraryMenuStyles.optionTextActive]}>
                  {LIBRARY_TAB_LABELS[tab]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const libraryMenuStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 36, 28, 0.28)'
  },
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  menu: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    backgroundColor: figmaColors.cream,
    shadowColor: figmaColors.black,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    backgroundColor: figmaColors.creamLight
  },
  optionActive: {
    backgroundColor: figmaColors.sepia,
    borderColor: figmaColors.umber
  },
  optionText: {
    fontFamily: appFonts.body,
    fontSize: 13,
    color: figmaColors.charcoal
  },
  optionTextActive: {
    color: figmaColors.tabTextActive
  }
});

function IconButton({
  icon,
  label,
  onPress,
  disabled
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[iconStyles.button, disabled && iconStyles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={20}
        color={disabled ? figmaColors.grayMuted : figmaColors.charcoal}
      />
    </Pressable>
  );
}

function ToolbarButton({
  icon,
  label,
  onPress,
  disabled,
  active
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable
      style={[
        toolbarStyles.button,
        active && toolbarStyles.buttonActive,
        disabled && toolbarStyles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={icon}
        size={18}
        color={disabled ? figmaColors.grayMuted : figmaColors.charcoal}
      />
      <Text style={[toolbarStyles.label, disabled && toolbarStyles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const iconStyles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    backgroundColor: figmaColors.inputBg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.4
  }
});

const toolbarStyles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: figmaColors.surfaceMuted
  },
  buttonActive: {
    backgroundColor: figmaColors.navItemActiveBg,
    borderWidth: 1,
    borderColor: figmaColors.border
  },
  buttonDisabled: {
    opacity: 0.45
  },
  label: {
    fontFamily: appFonts.body,
    fontSize: 11,
    color: figmaColors.charcoal
  },
  labelDisabled: {
    color: figmaColors.grayMuted
  }
});

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    topBar: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight,
      gap: s(8)
    },
    topBarButton: {
      minWidth: s(72)
    },
    backLink: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    historyGroup: {
      flexDirection: 'row',
      gap: s(6)
    },
    submitChip: {
      paddingHorizontal: s(14),
      paddingVertical: s(8),
      borderRadius: s(8),
      backgroundColor: figmaColors.buttonPrimaryBg
    },
    submitChipDisabled: {
      opacity: 0.6
    },
    submitChipText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.buttonPrimaryText
    },
    editorBody: {
      flex: 1,
      minHeight: 0,
      position: 'relative',
      overflow: 'hidden'
    },
    canvasStage: {
      flex: 1,
      minHeight: 0,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: figmaColors.parchment
    },
    canvasFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    sidebarOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      alignItems: 'flex-end',
      zIndex: 20,
      elevation: 20
    },
    sidebarPanel: {
      height: '100%',
      width: '100%',
      backgroundColor: figmaColors.cream,
      borderLeftWidth: 1,
      borderLeftColor: figmaColors.borderLight,
      paddingHorizontal: s(4),
      paddingTop: s(4),
      paddingBottom: s(4),
      overflow: 'hidden'
    },
    dragGhostLayer: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 40,
      elevation: 40
    },
    dragGhost: {
      position: 'absolute',
      width: 32,
      height: 32,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.white,
      padding: 2,
      shadowColor: figmaColors.black,
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6
    },
    dragGhostImage: {
      width: '100%',
      height: '100%',
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: figmaColors.white,
      alignItems: 'center',
      justifyContent: 'center'
    },
    dragGhostParchment: {
      backgroundColor: figmaColors.parchment,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    bottomPanel: {
      flexShrink: 0,
      borderTopWidth: 1,
      borderTopColor: figmaColors.borderLight,
      backgroundColor: figmaColors.background,
      paddingHorizontal: s(12),
      paddingTop: s(8),
      gap: s(8)
    },
    quickToolbar: {
      flexDirection: 'row',
      gap: s(8)
    },
    loader: { marginBottom: s(4) },
    doneWrap: {
      flex: 1,
      backgroundColor: figmaColors.background,
      padding: s(24),
      justifyContent: 'center',
      gap: s(16)
    },
    doneTitle: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    doneBody: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
