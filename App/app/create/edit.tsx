import * as ImagePicker from 'expo-image-picker';
import { appFonts } from '@/constants/appFonts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CreatePhotoSlot } from '@/components/create/CreatePhotoSlot';
import { editCopy } from '@/constants/createContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { cropCardPhoto, retakeCardPhotoWithCamera } from '@/lib/capture-photos';
import { createAndSubmitCardCapture } from '@/lib/submissions';
import { improveSubmissionNotes } from '@/lib/writing-improver';

export default function CreateEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    frontUri?: string;
    backUri?: string;
    linkedCardKey?: string;
    linkedCardTitle?: string;
  }>();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [frontUri, setFrontUri] = useState(
    typeof params.frontUri === 'string' ? params.frontUri : ''
  );
  const [backUri, setBackUri] = useState(
    typeof params.backUri === 'string' ? params.backUri : null
  );
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [done, setDone] = useState(false);

  const linkedCardId =
    typeof params.linkedCardKey === 'string' && params.linkedCardKey.length > 0
      ? params.linkedCardKey
      : null;
  const linkedCardTitle =
    typeof params.linkedCardTitle === 'string' && params.linkedCardTitle.length > 0
      ? params.linkedCardTitle
      : null;

  const addProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.88,
      allowsEditing: true,
      aspect: [3, 4]
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setProofUri(result.assets[0].uri);
    }
  };

  const handleImproveNotes = async () => {
    setError(null);
    setImproving(true);
    const { improved, error: improveError } = await improveSubmissionNotes(
      notes,
      linkedCardTitle
    );
    setImproving(false);
    if (improveError || !improved) {
      setError(improveError ?? editCopy.improveNotesError);
      return;
    }
    setNotes(improved);
  };

  const handleSend = async () => {
    if (!user?.id) {
      setError('You must be signed in to submit.');
      return;
    }
    if (!frontUri.trim()) {
      setError(editCopy.missingFront);
      return;
    }

    setError(null);
    setLoading(true);
    const { submissionId, error: submitError } = await createAndSubmitCardCapture(
      user.id,
      { frontUri, backUri, proofUri },
      notes,
      linkedCardId
    );
    setLoading(false);

    if (submitError || !submissionId) {
      setError(submitError ?? 'Submission failed.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <Text style={styles.title}>{editCopy.successTitle}</Text>
          <Text style={styles.subtitle}>{editCopy.successBody}</Text>
          <AuthPrimaryButton
            label={editCopy.backToAuthenticate}
            onPress={() => router.replace('/authenticate/authenticate')}
          />
          <Pressable onPress={() => router.replace('/create/create')}>
            <Text style={styles.link}>{editCopy.backToCreate}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editCopy.title}</Text>
        <Text style={styles.subtitle}>{editCopy.subtitle}</Text>

        <AuthErrorBanner message={error} />

        {linkedCardTitle ? (
          <View style={styles.linkedBanner}>
            <Text style={styles.linkedBannerText}>
              Catalog match: {linkedCardTitle}
            </Text>
          </View>
        ) : null}

        <CreatePhotoSlot
          label={editCopy.frontLabel}
          uri={frontUri || null}
          required
          onRetake={async () => {
            const uri = await retakeCardPhotoWithCamera();
            if (uri) setFrontUri(uri);
          }}
          onCrop={async () => {
            if (!frontUri) return;
            const uri = await cropCardPhoto(frontUri);
            if (uri) setFrontUri(uri);
          }}
        />

        {backUri ? (
          <CreatePhotoSlot
            label={editCopy.backLabel}
            uri={backUri}
            onRetake={async () => {
              const uri = await retakeCardPhotoWithCamera();
              if (uri) setBackUri(uri);
            }}
            onCrop={async () => {
              const uri = await cropCardPhoto(backUri);
              if (uri) setBackUri(uri);
            }}
          />
        ) : null}

        <Pressable style={styles.proofRow} onPress={() => void addProof()}>
          <Text style={styles.proofLabel}>
            {proofUri ? editCopy.proofLabel : editCopy.addProof}
          </Text>
          {proofUri ? (
            <Image source={{ uri: proofUri }} style={styles.proofThumb} resizeMode="cover" />
          ) : null}
        </Pressable>

        <TextInput
          style={styles.notes}
          placeholder={editCopy.notesPlaceholder}
          placeholderTextColor={figmaColors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={!loading && !improving}
        />

        {/* <Pressable
          style={({ pressed }) => [
            styles.improveRow,
            pressed && styles.improveRowPressed,
            (loading || improving) && styles.improveRowDisabled
          ]}
          disabled={loading || improving}
          onPress={() => void handleImproveNotes()}
        >
          <Text style={styles.improveLabel}>
            {improving ? editCopy.improvingNotes : editCopy.improveNotes}
          </Text>
        </Pressable> */}

        <AuthPrimaryButton
          label={editCopy.send}
          loading={loading}
          disabled={!frontUri || loading || improving}
          onPress={handleSend}
        />

        <Pressable onPress={() => router.replace('/camera/camera')} style={styles.linkPress}>
          <Text style={styles.link}>{editCopy.openCamera}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    scroll: {
      padding: s(24),
      gap: s(18),
      paddingBottom: s(40)
    },
    successWrap: {
      flex: 1,
      padding: s(24),
      justifyContent: 'center',
      gap: s(16),
      alignItems: 'center'
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.black,
      textAlign: 'center'
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    linkedBanner: {
      paddingVertical: s(10),
      paddingHorizontal: s(12),
      borderRadius: s(8),
      backgroundColor: figmaColors.ctaBackground,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    linkedBannerText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    proofRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: s(14),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.inputBg
    },
    proofThumb: {
      width: s(48),
      height: s(48),
      borderRadius: s(6)
    },
    proofLabel: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.accent
    },
    notes: {
      minHeight: s(96),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      backgroundColor: figmaColors.inputBg,
      padding: s(14),
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    improveRow: {
      alignSelf: 'flex-start',
      paddingVertical: s(10),
      paddingHorizontal: s(14),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.inputBg
    },
    improveRowPressed: { opacity: 0.88 },
    improveRowDisabled: { opacity: 0.45 },
    improveLabel: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    linkPress: { alignItems: 'center', paddingVertical: s(8) },
    link: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    }
  });
}
