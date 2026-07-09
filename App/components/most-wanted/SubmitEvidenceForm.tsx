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
import { pickEvidencePhoto, submitMostWantedEvidence } from '@/lib/most-wanted';

type SubmitEvidenceFormProps = {
  huntId: string;
  s: (n: number) => number;
  t: (n: number) => number;
  onSubmitted: () => void;
};

export function SubmitEvidenceForm({ huntId, s, t, onSubmitted }: SubmitEvidenceFormProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [evidenceType, setEvidenceType] = useState<MostWantedEvidenceTypeKey>('source_link');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsImage = evidenceType === 'card_front' || evidenceType === 'card_back' || evidenceType === 'jersey_reference' || evidenceType === 'screenshot';

  async function handlePickImage() {
    const uri = await pickEvidencePhoto();
    if (uri) setImageUri(uri);
  }

  async function handleSubmit() {
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
      <Text style={styles.sectionLabel}>Evidence Type</Text>
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

      {needsImage ? (
        <View style={styles.block}>
          <Text style={styles.sectionLabel}>Upload Image</Text>
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
              <Pressable onPress={() => setImageUri(null)} style={styles.removeBtn}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => void handlePickImage()} style={styles.uploadBtn}>
              <Text style={styles.uploadText}>Choose photo</Text>
            </Pressable>
          )}
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={styles.sectionLabel}>Source URL</Text>
        <TextInput
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="https://..."
          placeholderTextColor={figmaColors.gray}
          autoCapitalize="none"
          keyboardType="url"
          style={styles.input}
        />
      </View>

      <View style={styles.block}>
        <Text style={styles.sectionLabel}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe what this evidence shows..."
          placeholderTextColor={figmaColors.gray}
          multiline
          style={[styles.input, styles.notesInput]}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AuthPrimaryButton
        label={busy ? 'Submitting…' : 'Submit for Review'}
        onPress={() => void handleSubmit()}
        disabled={busy}
      />
      {busy ? <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(8) }} /> : null}
      <Text style={styles.hint}>{mostWantedCopy.submitSubtitle}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      gap: s(14)
    },
    sectionLabel: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8)
    },
    typeChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(6),
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
      color: figmaColors.charcoal
    },
    block: {
      gap: s(4)
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    notesInput: {
      minHeight: s(96),
      textAlignVertical: 'top'
    },
    uploadBtn: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      borderStyle: 'dashed',
      paddingVertical: s(24),
      alignItems: 'center',
      backgroundColor: figmaColors.cream
    },
    uploadText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    },
    previewWrap: {
      gap: s(8)
    },
    preview: {
      width: '100%',
      height: s(180),
      borderRadius: s(8),
      backgroundColor: figmaColors.tagBg
    },
    removeBtn: {
      alignSelf: 'flex-start'
    },
    removeText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
