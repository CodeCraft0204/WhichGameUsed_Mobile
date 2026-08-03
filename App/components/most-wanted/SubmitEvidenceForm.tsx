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
import { ResponseGifOverlay } from '@/components/ui/ResponseGifOverlay';
import { appFonts } from '@/constants/appFonts';
import {
  mostWantedCopy,
  mostWantedEvidenceTypes,
  type MostWantedEvidenceTypeKey
} from '@/constants/mostWantedCopy';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import {
  getEvidenceImageSignedUrl,
  getMostWantedDetail,
  getMyEvidenceSubmission,
  huntDisplayTitle,
  pickEvidencePhoto,
  resubmitMostWantedEvidence,
  submitMostWantedEvidence
} from '@/lib/most-wanted';

type SubmitEvidenceFormProps = {
  huntId: string;
  /** When set, the form edits this returned submission instead of creating a new one. */
  submissionId?: string;
  initialEvidenceType?: MostWantedEvidenceTypeKey;
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

const evidenceTypeIcons: Record<MostWantedEvidenceTypeKey, number> = {
  card_front: mostWantedIcons.evidenceImage,
  card_back: mostWantedIcons.evidenceImage,
  source_link: mostWantedIcons.evidenceLink,
  jersey_reference: mostWantedIcons.evidenceJersey,
  screenshot: mostWantedIcons.evidenceCamera,
  research_note: mostWantedIcons.evidenceNote
};

export function SubmitEvidenceForm({
  huntId,
  submissionId,
  initialEvidenceType,
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
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(!!submissionId);

  const editing = !!submissionId;
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

  useEffect(() => {
    if (!submissionId) return;
    let cancelled = false;

    void getMyEvidenceSubmission(submissionId).then(async ({ submission, error: loadError }) => {
      if (cancelled) return;
      if (loadError || !submission) {
        setError(loadError ?? 'Could not load your submission.');
        setLoadingExisting(false);
        return;
      }
      const knownType = mostWantedEvidenceTypes.find((opt) => opt.key === submission.evidence_type);
      if (knownType) setEvidenceType(knownType.key);
      setSourceUrl(submission.source_url ?? '');
      setNotes(submission.notes ?? '');
      setReviewerNotes(submission.review_notes);
      if (submission.image_bucket && submission.image_storage_path) {
        const url = await getEvidenceImageSignedUrl(
          submission.image_bucket,
          submission.image_storage_path
        );
        if (!cancelled) setExistingImageUrl(url);
      }
      if (!cancelled) setLoadingExisting(false);
    });

    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  async function handlePickImage(source: 'library' | 'camera') {
    const uri = await pickEvidencePhoto(source);
    if (uri) setImageUri(uri);
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 1) {
      if (needsImage && !imageUri && !existingImageUrl) {
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
    const { error: submitError } = editing
      ? await resubmitMostWantedEvidence({
          submissionId: submissionId!,
          evidenceType,
          sourceUrl,
          notes,
          imageUri
        })
      : await submitMostWantedEvidence({
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
    setShowGif(true);
  }

  return (
    <View style={styles.wrap}>
      <ResponseGifOverlay
        visible={showGif}
        onDone={() => {
          setShowGif(false);
          onSubmitted();
        }}
        mood="success"
        label="Evidence filed"
      />      {/* Hunt context — parchment banner like the detail hero */}
      {contextTitle ? (
        <View style={styles.contextPanel}>
          <Image source={mostWantedIcons.ctaShield} style={styles.contextShield} resizeMode="contain" />
          <View style={styles.contextBody}>
            <Text style={styles.contextLabel}>
              {editing ? 'UPDATING SUBMISSION FOR' : 'SUBMITTING FOR'}
            </Text>
            <Text style={styles.contextTitle} numberOfLines={2}>
              {contextTitle}
            </Text>
          </View>
        </View>
      ) : null}

      {editing && reviewerNotes ? (
        <View style={styles.reviewerBanner}>
          <Ionicons name="chatbubble-ellipses-outline" size={s(16)} color={figmaColors.brown} />
          <View style={styles.reviewerBannerBody}>
            <Text style={styles.reviewerBannerLabel}>REVIEWER FEEDBACK</Text>
            <Text style={styles.reviewerBannerText}>{reviewerNotes}</Text>
          </View>
        </View>
      ) : null}

      {loadingExisting ? (
        <ActivityIndicator color={figmaColors.charcoal} style={{ marginVertical: s(12) }} />
      ) : null}

      {/* Step rail */}
      <View style={styles.progressRow}>
        {STEPS.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <React.Fragment key={label}>
              {index > 0 ? <View style={[styles.progressLine, done && styles.progressLineDone]} /> : null}
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressDot,
                    active && styles.progressDotActive,
                    done && styles.progressDotDone
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={s(12)} color={figmaColors.success} />
                  ) : (
                    <Text style={[styles.progressDotText, active && styles.progressDotTextActive]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[styles.progressLabel, active && styles.progressLabelActive]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {!user ? (
        <View style={styles.authBanner}>
          <Ionicons name="lock-closed-outline" size={s(18)} color={figmaColors.brown} />
          <Text style={styles.authHint}>{mostWantedCopy.signInToContribute}</Text>
        </View>
      ) : null}

      {/* Step 1 — evidence type tile grid (Figma detail tile language) */}
      {step === 0 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{mostWantedCopy.submitStepType.toUpperCase()}</Text>
          <Text style={styles.sectionHint}>{mostWantedCopy.submitStepTypeHint}</Text>
          <View style={styles.tileGrid}>
            {mostWantedEvidenceTypes.map((opt) => {
              const active = opt.key === evidenceType;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setEvidenceType(opt.key)}
                  style={[styles.tile, active && styles.tileActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Image
                    source={evidenceTypeIcons[opt.key]}
                    style={styles.tileIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]} numberOfLines={2}>
                    {opt.label}
                  </Text>
                  <View style={styles.tileStatusRow}>
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={s(11)}
                      color={active ? figmaColors.success : figmaColors.taupeLight}
                    />
                    <Text
                      style={[
                        styles.tileStatusText,
                        { color: active ? figmaColors.success : figmaColors.grayMuted }
                      ]}
                    >
                      {active ? 'Selected' : 'Select'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {selectedType ? <Text style={styles.tileWhy}>{selectedType.hint}</Text> : null}
        </View>
      ) : null}

      {/* Step 2 — media */}
      {step === 1 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{mostWantedCopy.submitStepMedia.toUpperCase()}</Text>
          <Text style={styles.sectionHint}>{mostWantedCopy.submitStepMediaHint}</Text>

          {needsImage ? (
            imageUri || existingImageUrl ? (
              <View style={styles.previewWrap}>
                <View style={styles.previewFrame}>
                  <Image
                    source={{ uri: imageUri ?? existingImageUrl ?? undefined }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                </View>
                {!imageUri && existingImageUrl ? (
                  <Text style={styles.existingHint}>
                    Current photo from your submission. Pick a new one to replace it.
                  </Text>
                ) : null}
                <View style={styles.uploadRow}>
                  <Pressable onPress={() => void handlePickImage('library')} style={styles.uploadBtn}>
                    <Ionicons name="images-outline" size={s(15)} color={figmaColors.brownMuted} />
                    <Text style={styles.uploadText}>{imageUri ? 'LIBRARY' : 'REPLACE (LIBRARY)'}</Text>
                  </Pressable>
                  <Pressable onPress={() => void handlePickImage('camera')} style={styles.uploadBtn}>
                    <Ionicons name="camera-outline" size={s(15)} color={figmaColors.brownMuted} />
                    <Text style={styles.uploadText}>{imageUri ? 'CAMERA' : 'REPLACE (CAMERA)'}</Text>
                  </Pressable>
                </View>
                {imageUri ? (
                  <Pressable onPress={() => setImageUri(null)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>
                      {existingImageUrl ? 'Keep current photo' : 'Remove photo'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <View style={styles.uploadEmpty}>
                <Image
                  source={mostWantedIcons.evidenceCamera}
                  style={styles.uploadEmptyIcon}
                  resizeMode="contain"
                />
                <Text style={styles.uploadEmptyText}>{mostWantedCopy.submitUploadEmpty}</Text>
                <View style={styles.uploadRow}>
                  <Pressable onPress={() => void handlePickImage('library')} style={styles.uploadBtn}>
                    <Ionicons name="images-outline" size={s(15)} color={figmaColors.brownMuted} />
                    <Text style={styles.uploadText}>LIBRARY</Text>
                  </Pressable>
                  <Pressable onPress={() => void handlePickImage('camera')} style={styles.uploadBtn}>
                    <Ionicons name="camera-outline" size={s(15)} color={figmaColors.brownMuted} />
                    <Text style={styles.uploadText}>CAMERA</Text>
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
            placeholderTextColor={figmaColors.grayMuted}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.input}
          />
        </View>
      ) : null}

      {/* Step 3 — notes */}
      {step === 2 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{mostWantedCopy.submitStepNotes.toUpperCase()}</Text>
          <Text style={styles.sectionHint}>{mostWantedCopy.submitStepNotesHint}</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe what this evidence shows..."
            placeholderTextColor={figmaColors.grayMuted}
            multiline
            style={[styles.input, styles.notesInput]}
          />
        </View>
      ) : null}

      {/* Step 4 — review */}
      {step === 3 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>{mostWantedCopy.submitStepReview.toUpperCase()}</Text>
          <Text style={styles.sectionHint}>{mostWantedCopy.submitStepReviewHint}</Text>
          <View style={styles.reviewCard}>
            <ReviewRow
              icon={evidenceTypeIcons[evidenceType]}
              label="Type"
              value={selectedType?.label ?? evidenceType}
              styles={styles}
            />
            <View style={styles.reviewDivider} />
            <ReviewRow
              icon={needsImage ? mostWantedIcons.evidenceCamera : mostWantedIcons.evidenceLink}
              label="Media"
              value={
                needsImage
                  ? imageUri
                    ? 'New photo attached'
                    : existingImageUrl
                      ? 'Current photo kept'
                      : 'No photo'
                  : sourceUrl.trim()
                    ? sourceUrl.trim()
                    : 'No source URL'
              }
              styles={styles}
            />
            {sourceUrl.trim() && needsImage ? (
              <>
                <View style={styles.reviewDivider} />
                <ReviewRow
                  icon={mostWantedIcons.evidenceLink}
                  label="Source"
                  value={sourceUrl.trim()}
                  styles={styles}
                />
              </>
            ) : null}
            <View style={styles.reviewDivider} />
            <ReviewRow
              icon={mostWantedIcons.evidenceNote}
              label="Notes"
              value={notes.trim() || '—'}
              styles={styles}
            />
          </View>
          {imageUri || existingImageUrl ? (
            <View style={styles.previewFrame}>
              <Image
                source={{ uri: imageUri ?? existingImageUrl ?? undefined }}
                style={styles.reviewPreview}
                resizeMode="cover"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={s(16)} color={figmaColors.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {/* Nav: parchment back + dark Figma CTA */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <Pressable style={styles.backBtn} onPress={goBack} disabled={busy} accessibilityRole="button">
            <Ionicons name="chevron-back" size={s(13)} color={figmaColors.brownMuted} />
            <Text style={styles.backText}>{mostWantedCopy.submitBack.toUpperCase()}</Text>
          </Pressable>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Pressable
            style={[styles.nextCta, !user && styles.ctaDisabled]}
            onPress={goNext}
            disabled={!user}
            accessibilityRole="button"
          >
            <Text style={styles.nextCtaText}>{mostWantedCopy.submitNext.toUpperCase()}</Text>
            <Image source={mostWantedIcons.ctaArrow} style={styles.nextCtaArrow} resizeMode="contain" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submitCta, (busy || !user) && styles.ctaDisabled]}
            onPress={() => void handleSubmit()}
            disabled={busy || !user}
            accessibilityRole="button"
          >
            <Image source={mostWantedIcons.ctaShield} style={styles.submitCtaShield} resizeMode="contain" />
            <View>
              <Text style={styles.submitCtaTitle}>
                {busy ? 'SUBMITTING…' : editing ? 'RESUBMIT FOR REVIEW' : 'SUBMIT EVIDENCE'}
              </Text>
              <Text style={styles.submitCtaSub}>HELP COMPLETE THIS CARD</Text>
            </View>
          </Pressable>
        )}
      </View>
      {busy ? <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(8) }} /> : null}

      <Text style={styles.creditFooter}>{mostWantedCopy.submitCreditFooter}</Text>
      <Text style={styles.hint}>
        {editing
          ? 'Resubmitting sends this evidence back to Pending review with your updates.'
          : 'Your submission will appear under Contributions as Pending. Approved evidence earns contributor credit and leaderboard points.'}
      </Text>
    </View>
  );
}

function ReviewRow({
  icon,
  label,
  value,
  styles
}: {
  icon: number;
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewIconWrap}>
        <Image source={icon} style={styles.reviewIcon} resizeMode="contain" />
      </View>
      <View style={styles.reviewBody}>
        <Text style={styles.reviewLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { gap: s(14) },

    contextPanel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12)
    },
    contextShield: { width: s(26), height: s(30) },
    contextBody: { flex: 1, gap: s(2) },
    contextLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.6,
      color: figmaColors.brownMuted
    },
    contextTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      lineHeight: t(19),
      color: figmaColors.charcoal
    },

    reviewerBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      padding: s(12)
    },
    reviewerBannerBody: { flex: 1, gap: s(3) },
    reviewerBannerLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.6,
      color: figmaColors.brown
    },
    reviewerBannerText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.charcoal
    },

    progressRow: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    progressItem: {
      flex: 1,
      alignItems: 'center',
      gap: s(4)
    },
    progressLine: {
      height: 2,
      width: s(14),
      backgroundColor: figmaColors.stoneDark,
      marginTop: s(13)
    },
    progressLineDone: {
      backgroundColor: figmaColors.success
    },
    progressDot: {
      width: s(26),
      height: s(26),
      borderRadius: s(13),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressDotActive: {
      borderColor: figmaColors.sepia,
      borderWidth: 2,
      backgroundColor: figmaColors.surfaceHighlight
    },
    progressDotDone: {
      borderColor: figmaColors.success,
      backgroundColor: figmaColors.successBg
    },
    progressDotText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    progressDotTextActive: {
      color: figmaColors.charcoal
    },
    progressLabel: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.grayMuted,
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
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      padding: s(12)
    },
    authHint: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.brown
    },

    sectionBox: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingHorizontal: s(12),
      paddingVertical: s(12),
      gap: s(8),
      minHeight: s(230)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    sectionHint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(17),
      color: figmaColors.grayMuted
    },

    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(2)
    },
    tile: {
      width: '31.5%',
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingVertical: s(12),
      paddingHorizontal: s(6),
      alignItems: 'center',
      gap: s(6)
    },
    tileActive: {
      borderWidth: 2,
      borderColor: figmaColors.sepia,
      backgroundColor: figmaColors.surfaceHighlight
    },
    tileIcon: { width: s(28), height: s(26) },
    tileLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      lineHeight: t(15),
      color: figmaColors.brownMuted,
      textAlign: 'center',
      minHeight: t(30)
    },
    tileLabelActive: { color: figmaColors.charcoal },
    tileStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
    },
    tileStatusText: {
      fontFamily: appFonts.body,
      fontSize: t(11)
    },
    tileWhy: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(17),
      color: figmaColors.brown,
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(8)
    },

    input: {
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      borderRadius: s(9),
      paddingHorizontal: s(12),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.inputBg
    },
    notesInput: {
      minHeight: s(120),
      textAlignVertical: 'top'
    },

    uploadEmpty: {
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      borderStyle: 'dashed',
      paddingVertical: s(22),
      paddingHorizontal: s(16),
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.surfaceElevated
    },
    uploadEmptyIcon: { width: s(34), height: s(30) },
    uploadEmptyText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.grayMuted,
      textAlign: 'center'
    },
    uploadRow: {
      flexDirection: 'row',
      gap: s(8),
      width: '100%'
    },
    uploadBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      paddingVertical: s(11),
      backgroundColor: figmaColors.parchment
    },
    uploadText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    previewWrap: { gap: s(8) },
    previewFrame: {
      borderWidth: 1,
      borderColor: figmaColors.assetPreviewBorder,
      borderRadius: s(10),
      backgroundColor: figmaColors.assetPreviewBg,
      padding: s(4),
      overflow: 'hidden'
    },
    preview: {
      width: '100%',
      height: s(200),
      borderRadius: s(7)
    },
    removeBtn: { alignSelf: 'flex-start' },
    removeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.brown
    },
    existingHint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted
    },

    reviewCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      backgroundColor: figmaColors.surfaceElevated,
      paddingHorizontal: s(12),
      paddingVertical: s(4)
    },
    reviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: s(9)
    },
    reviewDivider: {
      height: 1,
      backgroundColor: figmaColors.divider
    },
    reviewIconWrap: {
      width: s(34),
      height: s(34),
      borderRadius: s(7),
      backgroundColor: figmaColors.surfaceMuted,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center'
    },
    reviewIcon: { width: s(18), height: s(18) },
    reviewBody: { flex: 1, gap: s(1) },
    reviewLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: figmaColors.grayMuted
    },
    reviewValue: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(17),
      color: figmaColors.charcoal
    },
    reviewPreview: {
      width: '100%',
      height: s(140),
      borderRadius: s(7)
    },

    navRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: s(10)
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(4),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      paddingHorizontal: s(14),
      backgroundColor: figmaColors.parchment
    },
    backText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    nextCta: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(10),
      backgroundColor: figmaColors.umber,
      borderWidth: 2,
      borderColor: figmaColors.sepia,
      borderRadius: s(12),
      paddingVertical: s(14)
    },
    nextCtaText: {
      fontFamily: appFonts.accent,
      fontSize: t(14),
      letterSpacing: 0.6,
      color: figmaColors.textOnDark
    },
    nextCtaArrow: { width: s(9), height: s(9), tintColor: figmaColors.textOnDark },
    submitCta: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(12),
      backgroundColor: figmaColors.umber,
      borderWidth: 2,
      borderColor: figmaColors.sepia,
      borderRadius: s(12),
      paddingVertical: s(10)
    },
    submitCtaShield: { width: s(24), height: s(28) },
    submitCtaTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(15),
      letterSpacing: 0.6,
      color: figmaColors.textOnDark,
      textAlign: 'center'
    },
    submitCtaSub: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: figmaColors.taupeLight,
      textAlign: 'center'
    },
    ctaDisabled: { opacity: 0.55 },

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
      color: figmaColors.grayMuted,
      textAlign: 'center'
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted,
      textAlign: 'center'
    }
  });
}
