import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { advocacyCopy } from '@/constants/advocacyCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { advocacyCampaignHref, advocacyHref, safeGoBack } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { submitAdvocacyEvidence } from '@/lib/advocacy';

export default function AdvocacySubmitEvidenceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ initiativeId?: string }>();
  const initiativeId = typeof params.initiativeId === 'string' ? params.initiativeId : '';
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [kind, setKind] = useState('other');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!initiativeId) {
      setError('Missing initiative.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await submitAdvocacyEvidence({
      initiative_id: initiativeId,
      evidence_kind: kind,
      title: title.trim(),
      body: body.trim(),
      url: url.trim()
    });
    setBusy(false);
    if (err) setError(err);
    else setDone(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProfileSubpageHeader
        title={advocacyCopy.submitEvidenceTitle}
        s={s}
        t={t}
        onBack={() =>
          safeGoBack(initiativeId ? advocacyCampaignHref(initiativeId) : advocacyHref())
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {done ? (
          <>
            <Text style={styles.success}>{advocacyCopy.submitted}</Text>
            <Pressable
              style={styles.cta}
              onPress={() =>
                router.replace(
                  initiativeId ? advocacyCampaignHref(initiativeId) : advocacyHref()
                )
              }
            >
              <Text style={styles.ctaText}>BACK</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.hint}>
              Evidence enters admin review. Only confirmed items appear as authoritative.
            </Text>
            <Text style={styles.label}>Evidence kind</Text>
            {(
              [
                'card_photo',
                'patch_closeup',
                'checklist',
                'auction_listing',
                'manufacturer_statement',
                'other'
              ] as const
            ).map((value) => (
              <Pressable key={value} style={styles.radio} onPress={() => setKind(value)}>
                <Text style={styles.radioText}>
                  {kind === value ? '●' : '○'} {value}
                </Text>
              </Pressable>
            ))}
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={body}
              onChangeText={setBody}
              multiline
            />
            <Text style={styles.label}>Source URL</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.cta, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void submit()}
            >
              <Text style={styles.ctaText}>{busy ? 'SUBMITTING…' : 'SUBMIT EVIDENCE'}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { padding: s(20), paddingBottom: s(40) },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray,
      marginBottom: s(6),
      marginTop: s(10)
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    area: { minHeight: s(90), textAlignVertical: 'top' },
    radio: { marginBottom: s(4) },
    radioText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.charcoal
    },
    cta: {
      marginTop: s(20),
      height: s(48),
      borderRadius: s(24),
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.buttonPrimaryBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    disabled: { opacity: 0.5 },
    ctaText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.buttonPrimaryText
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: '#8B2E2E',
      marginTop: s(8)
    },
    success: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.charcoal,
      marginBottom: s(16)
    }
  });
}
