import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EducationOriginalViewer } from '@/components/education/EducationOriginalViewer';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import {
  getEducationDocument,
  type EducationDocument
} from '@/constants/educationDocuments';
import { figmaColors } from '@/constants/figmaColors';
import { educationHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function EducationDocumentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; uri?: string; title?: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const document = useMemo((): EducationDocument | null => {
    const id = typeof params.id === 'string' ? params.id : '';
    const catalog = getEducationDocument(id);
    if (catalog) return catalog;

    // Ad-hoc remote PDF (e.g. timeline.pdf_url)
    if (id === 'remote-pdf' && typeof params.uri === 'string' && params.uri.trim()) {
      return {
        id: 'remote-pdf',
        title:
          typeof params.title === 'string' && params.title.trim()
            ? params.title.trim()
            : 'Document',
        kind: 'pdf',
        remoteUri: params.uri.trim()
      };
    }
    return null;
  }, [params.id, params.title, params.uri]);

  if (!document) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="ORIGINAL"
          subtitle="Not found"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <View style={styles.center}>
          <Text style={styles.error}>This document is not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <EducationOriginalViewer
      document={document}
      onClose={() => {
        if (router.canGoBack()) router.back();
        else router.replace(educationHref());
      }}
      s={s}
      t={t}
    />
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    center: { flex: 1, justifyContent: 'center', paddingHorizontal: s(24) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.error,
      textAlign: 'center'
    }
  });
}
