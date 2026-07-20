import React, { useCallback, useMemo, useRef, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewProps
} from 'react-native';
import { useRouter } from 'expo-router';
import { EducationCaseStudyCard } from '@/components/figma/EducationCaseStudyCard';
import { EducationGuideCard } from '@/components/figma/EducationGuideCard';
import { EducationToolCard } from '@/components/figma/EducationToolCard';
import { EducationVideoCard } from '@/components/figma/EducationVideoCard';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import {
  educationCaseStudies,
  educationGuides,
  educationIcons,
  educationJourneyChips,
  educationTools,
  educationVideos,
  guidesForTopic,
  videosForTopic,
  type EducationCaseStudyCta,
  type EducationGuide,
  type EducationJourneyStep,
  type EducationVideo
} from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import {
  authenticateHref,
  databaseWishlistHref,
  discussionHref,
  educationGuideOutlineHref,
  mostWantedHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // Ignore — device may not handle the scheme.
  }
}

function SectionTitle({
  title,
  page
}: {
  title: string;
  page: ReturnType<typeof createFigmaPageStyles>;
}) {
  return (
    <View style={page.sectionHeaderRow}>
      <Text style={page.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function EducationScreen() {
  return (
    <ContextHeaderScrollProvider>
      <EducationScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function EducationScreenBody() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeJourney, setActiveJourney] = useState<EducationJourneyStep>('LEARN');
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const sectionY = useRef<Record<string, number>>({});

  const scrollProps = {
    ...useContextHeaderScrollProps({
      contentContainerStyle: page.scrollContent
    }),
    ref: scrollRef
  } as ScrollViewProps;

  const onSectionLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      sectionY.current[key] = e.nativeEvent.layout.y;
    },
    []
  );

  const scrollToSection = useCallback((key: EducationJourneyStep) => {
    setActiveJourney(key);
    const map: Record<EducationJourneyStep, string> = {
      LEARN: 'learn',
      VERIFY: 'verify',
      RESEARCH: 'research',
      APPLY: 'apply'
    };
    const y = sectionY.current[map[key]];
    if (typeof y === 'number') {
      scrollRef.current?.scrollTo({ y: Math.max(y - 8, 0), animated: true });
    }
  }, []);

  const openGuide = useCallback(
    (guide: EducationGuide) => {
      if (guide.outlineSlug) {
        router.push(educationGuideOutlineHref(guide.outlineSlug));
        return;
      }
      if (guide.href) void openExternal(guide.href);
    },
    [router]
  );

  const openVideo = useCallback((video: EducationVideo) => {
    if (video.href) void openExternal(video.href);
  }, []);

  const openCaseCta = useCallback(
    (target: EducationCaseStudyCta) => {
      switch (target) {
        case 'mostwanted':
          router.push(mostWantedHref());
          return;
        case 'discussion':
          router.push(discussionHref());
          return;
        case 'wishlist':
          router.push(databaseWishlistHref());
          return;
        case 'authenticate':
          router.push(authenticateHref());
          return;
        case 'database':
          router.push('/database/database');
          return;
      }
    },
    [router]
  );

  const beginnerGuides = guidesForTopic('beginner');
  const intermediateGuides = guidesForTopic('intermediate');
  const fraudGuides = guidesForTopic('fraud');
  const fraudVideos = videosForTopic('fraud');

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="education" />}
      scrollProps={scrollProps}
    >
      <FigmaPageHeader
        title="EDUCATION"
        subtitle="LEARN THE HOBBY. SPOT THE FAKES."
        description="Learn, verify, research, then apply inside the app—curated guides and tools that help collectors study game-used cards and spot red flags."
        heroSource={educationIcons.hero}
        guidanceKey="education"
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels([...educationJourneyChips])}
          value={activeJourney}
          onChange={(value) => scrollToSection(value as EducationJourneyStep)}
          s={s}
          t={t}
          style={styles.chipRow}
        />
      </FigmaPageHeader>

      {/* LEARN */}
      <View onLayout={onSectionLayout('learn')}>
        <SectionTitle title="FEATURED GUIDES" page={page} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guideRow}
        >
          {educationGuides.map(({ key, ...guide }) => (
            <EducationGuideCard
              key={key}
              {...guide}
              s={s}
              t={t}
              onPress={() => openGuide({ key, ...guide })}
            />
          ))}
        </ScrollView>

        <SectionTitle title="FEATURED VIDEOS" page={page} />
        {educationVideos.map(({ key, ...video }) => (
          <EducationVideoCard
            key={key}
            {...video}
            s={s}
            t={t}
            onPress={() => openVideo({ key, ...video })}
          />
        ))}
      </View>

      {/* APPLY case studies early per plan order: after videos, before tools */}
      <View onLayout={onSectionLayout('apply')}>
        <SectionTitle title="REAL INVESTIGATION CASE STUDIES" page={page} />
        {educationCaseStudies.map(({ key, ...study }) => (
          <EducationCaseStudyCard
            key={key}
            {...study}
            s={s}
            t={t}
            onPressCta={() => openCaseCta(study.ctaTarget)}
          />
        ))}
      </View>

      {/* VERIFY */}
      <View onLayout={onSectionLayout('verify')}>
        <SectionTitle title="COLLECTOR RESEARCH TOOLS" page={page} />
        <Text style={styles.sectionHint}>
          Action tools for verifying certifications and holograms—not articles.
        </Text>
        {educationTools
          .filter((tool) => tool.topics.includes('verify'))
          .map(({ key, ...tool }) => (
            <EducationToolCard
              key={key}
              {...tool}
              s={s}
              t={t}
              onPress={() => void openExternal(tool.href)}
            />
          ))}
      </View>

      {/* RESEARCH */}
      <View onLayout={onSectionLayout('research')}>
        <SectionTitle title="RESEARCH ARCHIVES" page={page} />
        {educationTools
          .filter((tool) => tool.topics.includes('research'))
          .map(({ key, ...tool }) => (
            <EducationToolCard
              key={key}
              {...tool}
              s={s}
              t={t}
              onPress={() => void openExternal(tool.href)}
            />
          ))}

        <SectionTitle title="BEGINNER TOPICS" page={page} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guideRow}
        >
          {beginnerGuides.map(({ key, ...guide }) => (
            <EducationGuideCard
              key={`beg-${key}`}
              {...guide}
              compact
              s={s}
              t={t}
              onPress={() => openGuide({ key, ...guide })}
            />
          ))}
        </ScrollView>

        <SectionTitle title="INTERMEDIATE RESEARCH" page={page} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guideRow}
        >
          {intermediateGuides.map(({ key, ...guide }) => (
            <EducationGuideCard
              key={`int-${key}`}
              {...guide}
              compact
              s={s}
              t={t}
              onPress={() => openGuide({ key, ...guide })}
            />
          ))}
        </ScrollView>

        <SectionTitle title="FRAUD AND AUTHENTICATION" page={page} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guideRow}
        >
          {fraudGuides.map(({ key, ...guide }) => (
            <EducationGuideCard
              key={`fraud-${key}`}
              {...guide}
              compact
              s={s}
              t={t}
              onPress={() => openGuide({ key, ...guide })}
            />
          ))}
        </ScrollView>
        {fraudVideos.map(({ key, ...video }) => (
          <EducationVideoCard
            key={`fraud-v-${key}`}
            {...video}
            s={s}
            t={t}
            onPress={() => openVideo({ key, ...video })}
          />
        ))}
      </View>

      <Pressable
        onPress={() => router.push(authenticateHref())}
        style={({ pressed }) => [page.ctaCard, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Start authenticating"
      >
        <Image source={educationIcons.ctaShield} style={styles.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>KNOWLEDGE PROTECTS COLLECTORS.</Text>
          <Text style={page.ctaBody}>
            Learn the tells, verify the source, then apply what you know when you authenticate or
            contribute evidence.
          </Text>
        </View>
        <Image source={educationIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
      </Pressable>

      <Pressable
        onPress={() => router.push(mostWantedHref())}
        style={styles.secondaryCta}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryCtaText}>OPEN MOST WANTED</Text>
      </Pressable>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
    },
    guideRow: {
      gap: s(12),
      paddingBottom: s(8)
    },
    sectionHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.grayMuted,
      marginBottom: s(10)
    },
    ctaIcon: {
      width: s(64),
      height: s(44)
    },
    ctaArrow: {
      width: s(32),
      height: s(21),
      marginRight: s(6)
    },
    pressed: { opacity: 0.92 },
    secondaryCta: {
      alignSelf: 'center',
      marginTop: s(4),
      marginBottom: s(16),
      paddingVertical: s(10),
      paddingHorizontal: s(16)
    },
    secondaryCtaText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.bronze
    }
  });
}
