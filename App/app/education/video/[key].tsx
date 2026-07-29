import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EducationVideoViewer } from '@/components/education/EducationVideoViewer';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { educationHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { getEducationVideo } from '@/lib/education-video';

export default function EducationVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const video = useMemo(
    () => getEducationVideo(typeof params.key === 'string' ? params.key : null),
    [params.key]
  );

  if (!video) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="VIDEO"
          subtitle="Not found"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <View style={styles.center}>
          <Text style={styles.error}>This video is not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <EducationVideoViewer
      video={video}
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
