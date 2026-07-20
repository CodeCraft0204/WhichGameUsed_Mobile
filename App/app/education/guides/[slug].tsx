import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { guideByOutlineSlug } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import { educationHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function EducationGuideOutlineScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const guide = typeof slug === 'string' ? guideByOutlineSlug(slug) : undefined;

  if (!guide) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="GUIDE"
          subtitle="Not found"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <Text style={styles.error}>This guide outline is not available.</Text>
      </SafeAreaView>
    );
  }

  const difficulty =
    guide.difficulty === 'all'
      ? 'All levels'
      : guide.difficulty === 'beginner'
        ? 'Beginner'
        : 'Intermediate';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title="GUIDE OUTLINE"
          subtitle={guide.title}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        <Text style={styles.publisher}>{guide.publisher}</Text>
        <Text style={styles.meta}>
          {guide.lengthLabel} · {difficulty} · Reviewed {guide.lastReviewed}
        </Text>
        <Text style={styles.description}>{guide.description}</Text>

        <Text style={styles.sectionTitle}>WHAT YOU WILL LEARN</Text>
        {(guide.chapters ?? []).map((chapter, index) => (
          <View key={chapter} style={styles.chapterRow}>
            <Text style={styles.chapterIndex}>{index + 1}</Text>
            <Text style={styles.chapterText}>{chapter}</Text>
          </View>
        ))}

        {guide.href ? (
          <Pressable
            onPress={() => void Linking.openURL(guide.href!)}
            style={({ pressed }) => [styles.pdfCta, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Ionicons name="document-text-outline" size={s(18)} color={figmaColors.cream} />
            <Text style={styles.pdfCtaText}>OPEN PDF</Text>
          </Pressable>
        ) : (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonTitle}>Guide outline · PDF coming soon</Text>
            <Text style={styles.comingSoonBody}>
              Use this checklist while you examine cards. The full Which Game Used PDF will open here
              when it is published.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    error: {
      marginTop: s(24),
      paddingHorizontal: s(16),
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.error
    },
    publisher: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.brownMuted,
      marginBottom: s(4)
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      marginBottom: s(20)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.8,
      color: figmaColors.brown,
      marginBottom: s(10)
    },
    chapterRow: {
      flexDirection: 'row',
      gap: s(10),
      alignItems: 'flex-start',
      backgroundColor: figmaColors.parchment,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(12),
      marginBottom: s(8)
    },
    chapterIndex: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(14),
      color: figmaColors.bronze,
      minWidth: s(18)
    },
    chapterText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.charcoal
    },
    pdfCta: {
      marginTop: s(16),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      backgroundColor: figmaColors.umber,
      borderWidth: 1,
      borderColor: figmaColors.charcoal,
      borderRadius: s(10),
      paddingVertical: s(12)
    },
    pressed: { opacity: 0.9 },
    pdfCtaText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.cream
    },
    comingSoon: {
      marginTop: s(16),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      padding: s(14),
      gap: s(6)
    },
    comingSoonTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    comingSoonBody: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray
    }
  });
}
