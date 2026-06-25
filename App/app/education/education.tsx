import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EducationGuideCard } from '@/components/figma/EducationGuideCard';
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
  educationGuides,
  educationIcons,
  educationTabs,
  educationVideos
} from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function EducationScreen() {
  return (
    <ContextHeaderScrollProvider>
      <EducationScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function EducationScreenBody() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<(typeof educationTabs)[number]>(educationTabs[0]);
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="education" />}
      scrollProps={scrollProps}
    >
      <FigmaPageHeader
        title="EDUCATION"
        subtitle="LEARN THE HOBBY. SPOT THE FAKES."
        description="Explore guides, videos, and research tools that help collectors study game-used cards, identify fakes, and build evidence with confidence."
        heroSource={educationIcons.hero}
        guidanceKey="education"
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(educationTabs)}
          value={activeTab}
          onChange={setActiveTab}
          s={s}
          t={t}
          style={styles.chipRow}
        />      </FigmaPageHeader>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>FEATURED GUIDES (PDF)</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={figmaSharedIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guideRow}>
        {educationGuides.map(({ key, ...guide }) => (
          <EducationGuideCard key={key} {...guide} s={s} t={t} />
        ))}
      </ScrollView>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>FEATURED VIDEOS</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={figmaSharedIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {educationVideos.map(({ key, ...video }) => (
        <EducationVideoCard key={key} {...video} s={s} t={t} />
      ))}

      <View style={page.ctaCard}>
        <Image source={educationIcons.ctaShield} style={styles.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>KNOWLEDGE PROTECTS COLLECTORS.</Text>
          <Text style={page.ctaBody}>The more you learn, the harder it is to fool you.</Text>
        </View>
        <Image source={educationIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
    },
    viewAllText: {
      fontFamily: appFonts.body,
      fontSize: 15,
      color: figmaColors.gray
    },
    guideRow: {
      gap: s(12),
      paddingBottom: s(8)
    },
    ctaIcon: {
      width: s(64),
      height: s(44)
    },
    ctaArrow: {
      width: s(32),
      height: s(21),
      marginRight: s(6)
    }
  });
}
