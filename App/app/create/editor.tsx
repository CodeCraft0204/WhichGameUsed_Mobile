import { captureRef } from 'react-native-view-shot';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const params = useLocalSearchParams<{ templateId?: string; linkedCardKey?: string }>();
  const templateId = typeof params.templateId === 'string' ? params.templateId : '';
  const linkedCardId =
    typeof params.linkedCardKey === 'string' && params.linkedCardKey.length > 0
      ? params.linkedCardKey
      : null;

  const template = getPhotoTemplate(templateId);
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canvasRef = useRef<View>(null);

  const [slotPhotos, setSlotPhotos] = useState<SlotPhotos>(() => initialPhotos(templateId));
  const [slotTexts, setSlotTexts] = useState<SlotTexts>(() => initialTexts(templateId));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

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
      const uri = await captureRef(canvasRef, { format: 'jpg', quality: 0.92 });
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backLink}>{editorCopy.back}</Text>
      </Pressable>
      <Text style={styles.heading}>{template.name}</Text>
      <Text style={styles.lead}>{editorCopy.editorLead}</Text>

      <PhotoEditorCanvas
        ref={canvasRef}
        template={template}
        slotPhotos={slotPhotos}
        slotTexts={slotTexts}
        scale={0.92}
        onSlotPhotoChange={(slotId, uri) =>
          setSlotPhotos((prev) => ({ ...prev, [slotId]: uri }))
        }
        onSlotTextChange={(slotId, text) =>
          setSlotTexts((prev) => ({ ...prev, [slotId]: text }))
        }
      />

      {error ? <AuthErrorBanner message={error} /> : null}

      <AuthPrimaryButton
        label={busy ? editorCopy.submitting : editorCopy.submit}
        onPress={() => void onSubmit()}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} /> : null}
    </ScrollView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: figmaColors.background },
    content: { padding: s(16), gap: s(14), paddingBottom: s(40) },
    backLink: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    heading: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal
    },
    lead: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.gray
    },
    loader: { marginTop: s(8) },
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
