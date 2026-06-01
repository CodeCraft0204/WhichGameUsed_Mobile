import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { MostWantedRankCard } from '@/components/figma/MostWantedRankCard';
import {
  mostWantedIcons,
  mostWantedRanks,
  mostWantedSportTabs
} from '@/constants/mostWantedContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function MostWantedScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="mostwanted" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={[page.title, styles.title]}>MOST WANTED</Text>
        <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />

        <View style={styles.headerBody}>
          <View style={styles.headerText}>
            <Text style={[page.subtitle, styles.subtitle]}>
              VOTE THE HOBBY'S BIGGEST MYSTERIES TO THE TOP.
            </Text>
            <Text style={[page.description, styles.description]}>
              Track the 20 game-used cards collectors most want authenticated. Vote with likes and
              dislikes, discuss leads, and earn bounties for evidence that helps prove a card.
            </Text>
          </View>
        </View>

        <Image source={mostWantedIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

        <View style={styles.tabRow}>
          {mostWantedSportTabs.map((tab, index) => (
            <Pressable
              key={tab}
              style={[styles.tabButton, index === 0 && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>TOP 20 RANKING</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={figmaSharedIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {mostWantedRanks.map(({ key, ...rank }) => (
        <MostWantedRankCard key={key} {...rank} s={s} t={t} />
      ))}

      <View style={page.ctaCard}>
        <Image source={mostWantedIcons.ctaTrophy} style={styles.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>WE REWARD REAL RESEARCH.</Text>
          <Text style={page.ctaBody}>
            Your evidence can earn sealed product, classic game-used cards, and cash.
          </Text>
        </View>
        <Image source={mostWantedIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    headerSection: {
      minHeight: s(450),
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
      top: s(64),
      width: s(250),
      height: s(268)
    },
    tabRow: {
      marginTop: s(28),
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
      paddingHorizontal: s(4)
    },
    tabButtonActive: {
      backgroundColor: figmaColors.tabActiveBg,
      borderColor: figmaColors.tabActiveBorder
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(12),
      lineHeight: t(15),
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
    ctaIcon: {
      width: s(72),
      height: s(72)
    },
    ctaArrow: {
      width: s(32),
      height: s(21),
      marginRight: s(6)
    }
  });
}
