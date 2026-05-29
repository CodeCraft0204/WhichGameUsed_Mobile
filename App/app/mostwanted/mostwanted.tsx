import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/mostwanted/hero_illustration.png'),
  ctaTrophy: require('@/assets/figma/mostwanted/cta_trophy.png'),
  ctaArrow: require('@/assets/figma/mostwanted/cta_arrow.png'),
  rank1: require('@/assets/figma/mostwanted/rank_01_row.png'),
  rank2: require('@/assets/figma/mostwanted/rank_02_row.png'),
  rank3: require('@/assets/figma/mostwanted/rank_03_row.png'),
  rank4: require('@/assets/figma/mostwanted/rank_04_row.png'),
  rank5: require('@/assets/figma/mostwanted/rank_05_row.png')
};

const sportTabs = ['ALL', 'BASEBALL', 'BASKETBALL', 'FOOTBALL', 'ALL-TIME'] as const;

const rankRows = [icons.rank1, icons.rank2, icons.rank3, icons.rank4, icons.rank5];

export default function MostWantedScreen() {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      bottomNav={<FigmaHubBottomNav active="mostwanted" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: styles.scrollContent }}
    >
        <View style={styles.headerSection}>
          <Text style={styles.title}>MOST WANTED</Text>
          <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>VOTE THE HOBBY'S BIGGEST MYSTERIES TO THE TOP.</Text>
          <Text style={styles.description}>
            Track the 20 game-used cards collectors most want authenticated. Vote with likes and
            dislikes, discuss leads, and earn bounties for evidence that helps prove a card.
          </Text>
          <Image source={icons.hero} style={styles.heroImage} resizeMode="contain" />
          <FigmaUtilityBar s={s} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {sportTabs.map((tab, index) => (
              <Pressable key={tab} style={[styles.tabButton, index === 0 && styles.tabButtonActive]}>
                <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TOP 20 RANKING</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={figmaSharedIcons.sectionChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        {rankRows.map((row, index) => (
          <Image
            key={`rank-${index + 1}`}
            source={row}
            style={styles.rankRowImage}
            resizeMode="contain"
          />
        ))}

        <View style={styles.ctaCard}>
          <Image source={icons.ctaTrophy} style={styles.ctaIcon} resizeMode="contain" />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>WE REWARD REAL RESEARCH.</Text>
            <Text style={styles.ctaBody}>
              Your evidence can earn sealed product, classic game-used cards, and cash.
            </Text>
          </View>
          <Image source={icons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
        </View>
    </FigmaScreen>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: s(20),
      paddingTop: s(14),
      paddingBottom: s(16)
    },
    headerSection: {
      position: 'relative',
      minHeight: s(430),
      marginBottom: s(8)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(16),
      fontSize: t(48),
      lineHeight: t(72),
      color: '#2f302f',
      letterSpacing: -0.5,
      transform: [{ rotate: '-4deg' }],
      width: s(400)
    },
    titleBrush: {
      width: s(338),
      height: s(33),
      marginTop: s(-14),
      marginLeft: s(2)
    },
    subtitle: {
      marginTop: s(22),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      lineHeight: t(26),
      color: '#7c7c7b',
      width: s(360)
    },
    description: {
      marginTop: s(20),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      lineHeight: t(26),
      color: '#989797',
      width: s(380)
    },
    heroImage: {
      position: 'absolute',
      right: s(90),
      top: s(36),
      width: s(280),
      height: s(300)
    },
    tabRow: {
      marginTop: s(28),
      gap: s(12),
      paddingRight: s(8)
    },
    tabButton: {
      minWidth: s(100),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: '#d0cdc9',
      backgroundColor: '#f7f6f1',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(14)
    },
    tabButtonActive: {
      backgroundColor: '#3b3a3b',
      borderColor: '#302e30'
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      color: '#898888'
    },
    tabTextActive: {
      color: '#a1a1a1'
    },
    sectionHeaderRow: {
      marginTop: s(12),
      marginBottom: s(6),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#ece7e2',
      paddingTop: s(10)
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(26),
      color: '#535353'
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      color: '#c89c73'
    },
    sectionChevron: {
      width: s(10),
      height: s(17)
    },
    rankRowImage: {
      width: '100%',
      height: s(132),
      marginBottom: s(6)
    },
    ctaCard: {
      minHeight: s(116),
      borderRadius: s(15),
      borderWidth: 1,
      borderColor: '#e6e3de',
      backgroundColor: '#f2efe9',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(10)
    },
    ctaIcon: {
      width: s(100),
      height: s(90)
    },
    ctaTextWrap: {
      flex: 1,
      paddingHorizontal: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(20),
      color: '#464a4e',
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      lineHeight: t(22),
      color: '#848586'
    },
    ctaArrow: {
      width: s(37),
      height: s(27)
    }
  });
}
