import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthSubpageShell } from '@/components/auth/AuthSubpageShell';
import {
  COMMUNITY_STANDARDS_VERSION,
  communityStandardsSections
} from '@/constants/communityStandards';
import { legalCopy } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';
import { markCommunityStandardsAccepted } from '@/lib/community-standards-storage';

export default function CommunityStandardsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accept?: string }>();
  const acceptMode = params.accept === '1';
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = legalCopy.communityStandards;
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    await markCommunityStandardsAccepted();
    setAccepting(false);
    router.back();
  };

  return (
    <AuthSubpageShell
      title={copy.title}
      subtitle={copy.subtitle}
      footer={
        acceptMode ? (
          <AuthPrimaryButton
            label={copy.acceptButton}
            loading={accepting}
            onPress={handleAccept}
          />
        ) : null
      }
    >
      {/* <Text style={styles.version}>
        {copy.versionLabel} {COMMUNITY_STANDARDS_VERSION}
      </Text> */}

      {communityStandardsSections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.paragraphs.map((paragraph, index) => (
            <Text key={`${section.id}-${index}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}

      {!acceptMode ? (
        <Text style={styles.readOnlyNote}>{copy.readOnlyNote}</Text>
      ) : null}
    </AuthSubpageShell>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    version: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(4)
    },
    section: {
      gap: s(8),
      paddingBottom: s(4)
    },
    sectionTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      lineHeight: t(26),
      color: figmaColors.charcoal
    },
    paragraph: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    readOnlyNote: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      textAlign: 'center',
      marginTop: s(8)
    }
  });
}
