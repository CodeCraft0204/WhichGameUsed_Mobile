import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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
import {
  getMostWantedDetail,
  huntDisplayTitle,
  pickEvidencePhoto,
  submitMostWantedEvidence
} from '@/lib/most-wanted';

type SubmitEvidenceFormProps = {
  huntId: string;
  initialEvidenceType?: MostWantedEvidenceTypeKey;
  initialNotes?: string;
  s: (n: number) => number;
  t: (n: number) => number;
  onSubmitted: () => void;
};

const STEPS = [
  mostWantedCopy.submitStepType,
  mostWantedCopy.submitStepMedia,
  mostWantedCopy.submitStepNotes,
  mostWantedCopy.submitStepReview
] as const;

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
  const [step, setStep] = useState(0);
  const [contextTitle, setContextTitle] = useState<string | null>(null);
  const [evidenceType, setEvidenceType] = useState<MostWantedEvidenceTypeKey>(
    initialEvidenceType ?? 'source_link'
  );
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = mostWantedEvidenceTypes.find((opt) => opt.key === evidenceType);
  const needsImage =
    evidenceType === 'card_front' ||
    evidenceType === 'card_back' ||
    evidenceType === 'jersey_reference' ||
    evidenceType === 'screenshot';

  useEffect(() => {
    void getMostWantedDetail(huntId).then(({ detail }) => {
      if (detail?.hunt) setContextTitle(huntDisplayTitle(detail.hunt));
    });
  }, [huntId]);

  async function handlePickImage(source: 'library' | 'camera') {
    const uri = await pickEvidencePhoto(source);
    if (uri) setImageUri(uri);
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 1) {
      if (needsImage && !imageUri) {
        setError('Please upload an image for this evidence type.');
        return false;
      }
      if (evidenceType === 'source_link' && !sourceUrl.trim()) {
        setError('Please add a source URL.');
        return false;
      }
    }
    if (step === 2 && notes.trim().length < 8) {
      setError('Add a short note so reviewers understand this evidence.');
      return false;
    }
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 0));
  }

  async function handleSubmit() {
    if (!user) {
      setError(mostWantedCopy.signInToContribute);
      return;
    }
    if (!validateStep()) return;

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
      {contextTitle ? (
        <View style={styles.contextChip}>
          <Ionicons name="flame-outline" size={s(16)} color={figmaColors.accent} />
          <Text style={styles.contextText} numberOfLines={2}>
            Submitting for: {contextTitle}
          </Text>
        </View>
      ) : null}

      <View style={styles.progressRow}>
        {STEPS.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <View key={label} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  active && styles.progressDotActive,
                  done && styles.progressDotDone
                ]}
              >
                <Text
                  style={[
                    styles.progressDotText,
                    (active || done) && styles.progressDotTextActive
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.progressLabel, active && styles.progressLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {!user ? (
        <View style={styles.authBanner}>
          <Ionicons name="lock-closed-outline" size={s(18)} color={figmaColors.accent} />
          <Text style={styles.authHint}>{mostWantedCopy.signInToContribute}</Text>
        </View>
      ) : null}

      {step === 0 ? (
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
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {selectedType ? <Text style={styles.typeWhy}>{selectedType.hint}</Text> : null}
        </View>
      ) : null}

      {step === 1 ? (
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
            placeholder={
              evidenceType === 'source_link'
                ? 'Source URL (required)'
                : 'Source URL (optional for images)'
            }
            placeholderTextColor={figmaColors.gray}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.input}
          />
        </View>
      ) : null}

      {step === 2 ? (
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
      ) : null}

      {step === 3 ? (
        <View style={styles.step}>
          <Text style={styles.stepLabel}>{mostWantedCopy.submitStepReview}</Text>
          <Text style={styles.stepHint}>{mostWantedCopy.submitStepReviewHint}</Text>
          <View style={styles.reviewCard}>
            <ReviewRow label="Type" value={selectedType?.label ?? evidenceType} styles={styles} />
            <ReviewRow
              label="Media"
              value={
                needsImage
                  ? imageUri
                    ? 'Photo attached'
                    : 'No photo'
                  : sourceUrl.trim()
                    ? sourceUrl.trim()
                    : 'No source URL'
              }
              styles={styles}
            />
            {sourceUrl.trim() && needsImage ? (
              <ReviewRow label="Source" value={sourceUrl.trim()} styles={styles} />
            ) : null}
            <ReviewRow label="Notes" value={notes.trim() || '—'} styles={styles} />
          </View>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.reviewPreview} resizeMode="cover" />
          ) : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={s(16)} color={figmaColors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.creditFooter}>{mostWantedCopy.submitCreditFooter}</Text>

      <View style={styles.navRow}>
        {step > 0 ? (
          <Pressable style={styles.backBtn} onPress={goBack} disabled={busy}>
            <Text style={styles.backText}>{mostWantedCopy.submitBack}</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        {step < STEPS.length - 1 ? (
          <View style={styles.nextWrap}>
            <AuthPrimaryButton label={mostWantedCopy.submitNext} onPress={goNext} disabled={!user} />
          </View>
        ) : (
          <View style={styles.nextWrap}>
            <AuthPrimaryButton
              label={busy ? 'Submitting…' : mostWantedCopy.submitConfirm}
              onPress={() => void handleSubmit()}
              disabled={busy || !user}
            />
          </View>
        )}
      </View>
      {busy ? <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(8) }} /> : null}
      <Text style={styles.hint}>
        Your submission will appear under Contributions as Pending. Approved evidence earns
        contributor credit and leaderboard points.
      </Text>
    </View>
  );
}

function ReviewRow({
  label,
  value,
  styles
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { gap: s(16) },
    contextChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(10)
    },
    contextText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    progressRow: {
      flexDirection: 'row',
      gap: s(6)
    },
    progressItem: {
      flex: 1,
      alignItems: 'center',
      gap: s(4)
    },
    progressDot: {
      width: s(26),
      height: s(26),
      borderRadius: s(13),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressDotActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    },
    progressDotDone: {
      borderColor: figmaColors.success,
      backgroundColor: figmaColors.successBg
    },
    progressDotText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.gray
    },
    progressDotTextActive: {
      color: figmaColors.charcoal
    },
    progressLabel: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    progressLabelActive: {
      color: figmaColors.charcoal,
      fontFamily: appFonts.bodyBold
    },
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
    step: { gap: s(8), minHeight: s(220) },
    stepLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(16),
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
    typeWhy: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.accent,
      marginTop: s(4)
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
      minHeight: s(120),
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
    reviewCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      padding: s(12),
      gap: s(10)
    },
    reviewRow: { gap: s(2) },
    reviewLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.gray,
      textTransform: 'uppercase'
    },
    reviewValue: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    reviewPreview: {
      width: '100%',
      height: s(140),
      borderRadius: s(12),
      backgroundColor: figmaColors.assetPreviewBg
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10)
    },
    backBtn: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(16),
      paddingVertical: s(14),
      backgroundColor: figmaColors.cream
    },
    backText: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    backSpacer: { width: s(72) },
    nextWrap: { flex: 1 },
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
    creditFooter: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
