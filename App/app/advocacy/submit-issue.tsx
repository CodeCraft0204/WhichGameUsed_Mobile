import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { advocacyCopy } from '@/constants/advocacyCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { advocacyHref, safeGoBack } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { submitAdvocacyIssue, type AdvocacyInitiativeType } from '@/lib/advocacy';

export default function AdvocacySubmitIssueScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [type, setType] = useState<AdvocacyInitiativeType>('collector_alert');
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [organization, setOrganization] = useState('');
  const [requested, setRequested] = useState('');
  const [sourceUrls, setSourceUrls] = useState('');
  const [contactOk, setContactOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!title.trim() || !explanation.trim()) {
      setError('Title and explanation are required.');
      return;
    }
    setBusy(true);
    setError(null);
    const urls = sourceUrls
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter(Boolean);
    const { error: err } = await submitAdvocacyIssue({
      initiative_type: type,
      title: title.trim(),
      explanation: explanation.trim(),
      organization_name: organization.trim(),
      requested_outcome: requested.trim(),
      source_urls: urls,
      contact_ok: contactOk
    });
    setBusy(false);
    if (err) setError(err);
    else setDone(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProfileSubpageHeader
        title={advocacyCopy.submitIssueTitle}
        s={s}
        t={t}
        onBack={() => safeGoBack(advocacyHref())}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{advocacyCopy.submitIssueHint}</Text>
        {done ? (
          <>
            <Text style={styles.success}>{advocacyCopy.submitted}</Text>
            <Pressable style={styles.cta} onPress={() => router.replace(advocacyHref())}>
              <Text style={styles.ctaText}>BACK TO ADVOCACY</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>Issue type</Text>
            {(
              [
                ['collector_alert', 'Collector Alert'],
                ['transparency_initiative', 'Transparency'],
                ['standards_proposal', 'Standards'],
                ['record_correction', 'Record Correction']
              ] as const
            ).map(([value, label]) => (
              <Pressable key={value} style={styles.radio} onPress={() => setType(value)}>
                <Text style={styles.radioText}>
                  {type === value ? '●' : '○'} {label}
                </Text>
              </Pressable>
            ))}
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Short explanation</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={explanation}
              onChangeText={setExplanation}
              multiline
            />
            <Text style={styles.label}>Manufacturer / seller / marketplace</Text>
            <TextInput style={styles.input} value={organization} onChangeText={setOrganization} />
            <Text style={styles.label}>Requested correction or outcome</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={requested}
              onChangeText={setRequested}
              multiline
            />
            <Text style={styles.label}>Source URLs (one per line)</Text>
            <TextInput
              style={[styles.input, styles.area]}
              value={sourceUrls}
              onChangeText={setSourceUrls}
              multiline
              autoCapitalize="none"
            />
            <Pressable style={styles.radio} onPress={() => setContactOk((v) => !v)}>
              <Text style={styles.radioText}>
                {contactOk ? '☑' : '☐'} Permission to contact me about this submission
              </Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.cta, busy && styles.disabled]}
              disabled={busy}
              onPress={() => void submit()}
            >
              <Text style={styles.ctaText}>{busy ? 'SUBMITTING…' : 'SUBMIT FOR REVIEW'}</Text>
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
    radio: { marginBottom: s(6) },
    radioText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
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
