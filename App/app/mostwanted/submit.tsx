import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { SubmitEvidenceForm } from '@/components/most-wanted/SubmitEvidenceForm';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { mostWantedContributionsHref, mostWantedHref, safeGoBack } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function MostWantedSubmitScreen() {
  const router = useRouter();
  const { huntId, evidenceType, submissionId } = useLocalSearchParams<{
    huntId: string;
    evidenceType?: string;
    submissionId?: string;
  }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const editing = typeof submissionId === 'string' && submissionId.length > 0;

  if (!huntId || typeof huntId !== 'string') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Missing hunt id.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProfileSubpageHeader
          title={mostWantedCopy.submitTitle}
          subtitle={mostWantedCopy.submitSubtitle}
          description={
            editing
              ? 'Update your submission based on the reviewer feedback, then send it back for review.'
              : 'Follow the guided steps to share useful evidence for this Most Wanted card.'
          }
          s={s}
          t={t}
          onBack={() => safeGoBack(mostWantedHref())}
        />
        <SubmitEvidenceForm
          huntId={huntId}
          submissionId={editing ? submissionId : undefined}
          initialEvidenceType={evidenceType as import('@/constants/mostWantedCopy').MostWantedEvidenceTypeKey | undefined}
          s={s}
          t={t}
          onSubmitted={() => router.replace(mostWantedContributionsHref())}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    error: { padding: s(20), color: figmaColors.accent }
  });
}
