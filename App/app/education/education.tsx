import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EducationGuideCard } from '@/components/figma/EducationGuideCard';
import { EducationVideoCard } from '@/components/figma/EducationVideoCard';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
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
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={[page.title, styles.title]}>EDUCATION</Text>
        <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />

        <View style={styles.headerBody}>
          <View style={styles.headerText}>
            <Text style={[page.subtitle, styles.subtitle]}>LEARN THE HOBBY. SPOT THE FAKES.</Text>
            <Text style={[page.description, styles.description]}>
              Explore guides, videos, and research tools that help collectors study game-used cards,
              identify fakes, and build evidence with confidence.
            </Text>
          </View>
        </View>

        <Image source={educationIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

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
      </View>

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
    headerSection: {
      minHeight: s(480),
      paddingRight: s(88)
    },
    title: {
      width: '100%',
      alignSelf: 'flex-start',
      lineHeight: t(58),
      marginTop: s(12)
    },
    titleBrush: {
      width: '92%',
      maxWidth: s(480),
      height: s(33),
      marginTop: s(14),
      marginLeft: s(2)
    },
    headerBody: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    headerText: {
      flex: 1,
      minWidth: 0,
      maxWidth: s(420),
      paddingRight: s(8),
      zIndex: 1
    },
    subtitle: {
      marginTop: s(22)
    },
    description: {
      marginTop: s(20),
      width: '100%'
    },
    heroImage: {
      position: 'absolute',
      right: s(88),
      top: s(84),
      width: s(210),
      height: s(226)
    },
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
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.tabText,
      textAlign: 'center'
    },
    tabTextActive: {
      color: figmaColors.tabTextActive
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
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
