import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as ViewType
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import {
  PhotoEditorCanvas,
  type SlotPhotos,
  type SlotTexts
} from '@/components/create/PhotoEditorCanvas';
import { appFonts } from '@/constants/appFonts';
import { editorCopy } from '@/constants/createContent';
import { getPhotoTemplate } from '@/constants/photoEditorTemplates';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { captureEditorCanvas } from '@/lib/capture-editor-canvas';
import { submitContentCreation } from '@/lib/content-submissions';

function initialPhotos(templateId: string): SlotPhotos {
  const tpl = getPhotoTemplate(templateId);
  if (!tpl) return {};
  return Object.fromEntries(tpl.slots.map((s) => [s.id, null]));
}

function initialTexts(templateId: string): SlotTexts {
  const tpl = getPhotoTemplate(templateId);
  if (!tpl) return {};
  return Object.fromEntries(tpl.textSlots.map((s) => [s.id, '']));
}

export default function CreateEditorScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ templateId?: string; linkedCardKey?: string }>();
  const templateId = typeof params.templateId === 'string' ? params.templateId : '';
  const linkedCardId =
    typeof params.linkedCardKey === 'string' && params.linkedCardKey.length > 0
      ? params.linkedCardKey
      : null;

  const template = getPhotoTemplate(templateId);
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canvasRef = useRef<ViewType>(null);
  const canvasStageRef = useRef<ViewType>(null);

  const [slotPhotos, setSlotPhotos] = useState<SlotPhotos>(() => initialPhotos(templateId));
  const [slotTexts, setSlotTexts] = useState<SlotTexts>(() => initialTexts(templateId));
  const [canvasArea, setCanvasArea] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleCanvasAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasArea((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  if (!template) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>{editorCopy.missingTemplate}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>{editorCopy.back}</Text>
        </Pressable>
      </View>
    );
  }

  const title = slotTexts.title ?? slotTexts.caption ?? Object.values(slotTexts).find(Boolean) ?? '';
  const body = slotTexts.body ?? Object.values(slotTexts).filter((v) => v && v !== title).join('\n');

  const hasPhoto = Object.values(slotPhotos).some(Boolean);

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

    setBusy(true);
    setError(null);
    try {
      const uri = await captureEditorCanvas(canvasRef);
      const { submissionId, error: submitError } = await submitContentCreation({
        templateId: template.id,
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
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {template.name}
        </Text>
        <Pressable
          style={[styles.submitChip, busy && styles.submitChipDisabled]}
          onPress={() => void onSubmit()}
          disabled={busy}
        >
          <Text style={styles.submitChipText}>{busy ? '…' : 'Submit'}</Text>
        </Pressable>
      </View>

      <View ref={canvasStageRef} style={styles.canvasStage} onLayout={handleCanvasAreaLayout}>
        {canvasArea.width > 0 && canvasArea.height > 0 ? (
          <PhotoEditorCanvas
            ref={canvasRef}
            template={template}
            slotPhotos={slotPhotos}
            slotTexts={slotTexts}
            width={canvasArea.width}
            height={canvasArea.height}
            onSlotPhotoChange={(slotId, uri) =>
              setSlotPhotos((prev) => ({ ...prev, [slotId]: uri }))
            }
            onSlotTextChange={(slotId, text) =>
              setSlotTexts((prev) => ({ ...prev, [slotId]: text }))
            }
            style={styles.canvasFill}
          />
        ) : null}
      </View>

      {error ? (
        <View style={[styles.errorBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <AuthErrorBanner message={error} />
        </View>
      ) : null}

      {busy ? (
        <View style={styles.busyOverlay} pointerEvents="none">
          <ActivityIndicator color={figmaColors.charcoal} />
        </View>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: figmaColors.stone
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
      gap: s(8),
      backgroundColor: figmaColors.background
    },
    topBarButton: {
      minWidth: s(72)
    },
    topBarTitle: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(16),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    backLink: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    submitChip: {
      minWidth: s(72),
      alignItems: 'flex-end',
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
    canvasStage: {
      flex: 1,
      minHeight: 0,
      backgroundColor: figmaColors.parchment,
      overflow: 'hidden'
    },
    canvasFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    errorBar: {
      flexShrink: 0,
      paddingHorizontal: s(12),
      paddingTop: s(8),
      backgroundColor: figmaColors.background,
      borderTopWidth: 1,
      borderTopColor: figmaColors.borderLight
    },
    busyOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(247, 241, 228, 0.45)'
    },
    missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: s(24) },
    missingText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
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
