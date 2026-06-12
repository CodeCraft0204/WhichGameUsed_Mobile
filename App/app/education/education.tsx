import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EducationGuideCard } from '@/components/figma/EducationGuideCard';
import { EducationVideoCard } from '@/components/figma/EducationVideoCard';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  educationGuides,
  educationIcons,
  educationTabRows,
  educationTabs,
  educationVideos
} from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function EducationScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="education" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <FigmaPageHeader
        title="EDUCATION"
        subtitle="LEARN THE HOBBY. SPOT THE FAKES."
        description="Explore guides, videos, and research tools that help collectors study game-used cards, identify fakes, and build evidence with confidence."
        heroSource={educationIcons.hero}
        s={s}
        page={page}
      >
        <View style={styles.tabWrap}>
          {educationTabRows.map((row, rowIndex) => (
            <View key={`tab-row-${rowIndex}`} style={styles.tabRow}>
              {row.map((tab) => {
                const isActive = tab === educationTabs[0];

                return (
                  <Pressable
                    key={tab}
                    style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </FigmaPageHeader>

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
    tabWrap: {
      marginTop: s(28),
      width: '100%',
      gap: s(10)
    },
    tabRow: {
      flexDirection: 'row',
      width: '100%',
      gap: s(8)
    },
    tabButton: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.tabInactiveBorder,
      backgroundColor: figmaColors.tabInactiveBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(8)
    },
    tabButtonActive: {
      backgroundColor: figmaColors.tabActiveBg,
      borderColor: figmaColors.tabActiveBorder
    },
    tabText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.tabText,
      textAlign: 'center'
    },
    tabTextActive: {
      color: figmaColors.tabTextActive
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
