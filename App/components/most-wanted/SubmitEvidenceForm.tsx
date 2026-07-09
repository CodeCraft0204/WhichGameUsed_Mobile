import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { appFonts } from '@/constants/appFonts';
import {
  mostWantedCopy,
  mostWantedEvidenceTypes,
  type MostWantedEvidenceTypeKey
} from '@/constants/mostWantedCopy';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { pickEvidencePhoto, submitMostWantedEvidence } from '@/lib/most-wanted';

type SubmitEvidenceFormProps = {
  huntId: string;
  initialEvidenceType?: MostWantedEvidenceTypeKey;
  initialNotes?: string;
  s: (n: number) => number;
  t: (n: number) => number;
  onSubmitted: () => void;
};

export function SubmitEvidenceForm({
  huntId,
  initialEvidenceType,
  initialNotes,
  s,
  t,
  onSubmitted
}: SubmitEvidenceFormProps) {
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [evidenceType, setEvidenceType] = useState<MostWantedEvidenceTypeKey>(initialEvidenceType ?? 'source_link');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsImage =
    evidenceType === 'card_front' ||
    evidenceType === 'card_back' ||
    evidenceType === 'jersey_reference' ||
    evidenceType === 'screenshot';

  async function handlePickImage(source: 'library' | 'camera') {
    const uri = await pickEvidencePhoto(source);
    if (uri) setImageUri(uri);
  }

  async function handleSubmit() {
    if (!user) {
      setError(mostWantedCopy.signInToContribute);
      return;
    }
    setError(null);
    if (needsImage && !imageUri) {
      setError('Please upload an image for this evidence type.');
      return;
    }
    if (evidenceType === 'source_link' && !sourceUrl.trim()) {
      setError('Please add a source URL.');
      return;
    }

    setBusy(true);
    const { error: submitError } = await submitMostWantedEvidence({
      huntId,
      evidenceType,
      sourceUrl,
      notes,
      imageUri
    });
    setBusy(false);

    if (submitError) {
      setError(submitError);
      return;
    }
    onSubmitted();
  }

  return (
    <View style={styles.wrap}>
      {!user ? (
        <View style={styles.authBanner}>
          <Ionicons name="lock-closed-outline" size={s(18)} color={figmaColors.accent} />
          <Text style={styles.authHint}>{mostWantedCopy.signInToContribute}</Text>
        </View>
      ) : null}

      <View style={styles.step}>
        <Text style={styles.stepLabel}>{mostWantedCopy.submitStepType}</Text>
        <Text style={styles.stepHint}>{mostWantedCopy.submitStepTypeHint}</Text>
        <View style={styles.typeGrid}>
          {mostWantedEvidenceTypes.map((opt) => {
            const active = opt.key === evidenceType;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setEvidenceType(opt.key)}
                style={[styles.typeChip, active && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>{mostWantedCopy.submitStepMedia}</Text>
        <Text style={styles.stepHint}>{mostWantedCopy.submitStepMediaHint}</Text>

        {needsImage ? (
          imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <Pressable onPress={() => setImageUri(null)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove photo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadEmpty}>
              <Ionicons name="image-outline" size={s(28)} color={figmaColors.gray} />
              <Text style={styles.uploadEmptyText}>{mostWantedCopy.submitUploadEmpty}</Text>
              <View style={styles.uploadRow}>
                <Pressable onPress={() => void handlePickImage('library')} style={styles.uploadBtn}>
                  <Ionicons name="images-outline" size={s(16)} color={figmaColors.charcoal} />
                  <Text style={styles.uploadText}>Library</Text>
                </Pressable>
                <Pressable onPress={() => void handlePickImage('camera')} style={styles.uploadBtn}>
                  <Ionicons name="camera-outline" size={s(16)} color={figmaColors.charcoal} />
                  <Text style={styles.uploadText}>Camera</Text>
                </Pressable>
              </View>
            </View>
          )
        ) : null}

        <TextInput
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="Source URL (optional for images)"
          placeholderTextColor={figmaColors.gray}
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
        />
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>{mostWantedCopy.submitStepNotes}</Text>
        <Text style={styles.stepHint}>{mostWantedCopy.submitStepNotesHint}</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe what this evidence shows..."
          placeholderTextColor={figmaColors.gray}
          multiline
          style={[styles.input, styles.notesInput]}
        />
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>{mostWantedCopy.submitStepReview}</Text>
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={s(16)} color={figmaColors.error} />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <AuthPrimaryButton
          label={busy ? 'Submitting…' : 'Submit for Review'}
          onPress={() => void handleSubmit()}
          disabled={busy || !user}
        />
        {busy ? <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(8) }} /> : null}
        <Text style={styles.hint}>{mostWantedCopy.submitSubtitle}</Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { gap: s(20) },
    authBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(12)
    },
    authHint: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent
    },
    step: { gap: s(8) },
    stepLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    stepHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(2)
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8)
    },
    typeChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      backgroundColor: figmaColors.cream
    },
    typeChipActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    },
    typeChipText: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    typeChipTextActive: {
      fontFamily: appFonts.bodyBold,
      color: figmaColors.charcoal
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    notesInput: {
      minHeight: s(100),
      textAlignVertical: 'top'
    },
    uploadEmpty: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      borderStyle: 'dashed',
      paddingVertical: s(24),
      paddingHorizontal: s(16),
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.cream
    },
    uploadEmptyText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    uploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(12),
      backgroundColor: figmaColors.surface
    },
    uploadRow: {
      flexDirection: 'row',
      gap: s(8),
      width: '100%'
    },
    uploadText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    previewWrap: { gap: s(8) },
    preview: {
      width: '100%',
      height: s(200),
      borderRadius: s(12),
      backgroundColor: figmaColors.assetPreviewBg
    },
    removeBtn: { alignSelf: 'flex-start' },
    removeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.accent
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(8),
      backgroundColor: figmaColors.errorBg,
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      borderRadius: s(10),
      padding: s(10)
    },
    error: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.error
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      textAlign: 'center',
      marginTop: s(4)
    }
  });
}
