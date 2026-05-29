import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/leaderboard/hero_trophy.png'),
  ctaTrophy: require('@/assets/figma/leaderboard/cta_trophy.png'),
  ctaArrow: require('@/assets/figma/leaderboard/cta_arrow.png'),
  sectionChevron: require('@/assets/figma/leaderboard/section_chevron.png')
};

const periodTabs = ['THIS MONTH', 'THIS YEAR', 'ALL-TIME'] as const;

const rankings = [
  {
    key: '1',
    rank: '#1',
    name: 'PatchProof',
    role: 'Patch specialist',
    points: '12,840',
    avatar: require('@/assets/figma/leaderboard/avatar_rank1.png'),
    highlight: true
  },
  {
    key: '2',
    rank: '#2',
    name: 'RuthArchive',
    role: 'Photo match researcher',
    points: '10,615',
    avatar: require('@/assets/figma/leaderboard/avatar_rank2.png')
  },
  {
    key: '3',
    rank: '#3',
    name: 'CardDetective',
    role: 'Authentication investigator',
    points: '9,432',
    avatar: require('@/assets/figma/leaderboard/avatar_rank3.png')
  },
  {
    key: '4',
    rank: '#4',
    name: 'ProvenanceGuy',
    role: 'Vintage source hunter',
    points: '8,275',
    avatar: require('@/assets/figma/leaderboard/avatar_rank4.png')
  },
  {
    key: '5',
    rank: '#5',
    name: 'WaxScholar',
    role: 'Hobby researcher',
    points: '7,189',
    avatar: require('@/assets/figma/leaderboard/avatar_rank5.png')
  }
];

export default function LeaderboardScreen() {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      bottomNav={<FigmaHubBottomNav active="leaderboard" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: styles.scrollContent }}
    >
        <View style={styles.headerSection}>
          <Text style={styles.title}>LEADERBOARD</Text>
          <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>THE HOBBY'S LEADING{'\n'}EXPERTS IN RABBIT HOLES.</Text>
          <Text style={styles.description}>
            Track the top 20 users on the platform each month. Rankings are based on a points system
            that rewards strong authentication work, helpful participation, and research contributions.
          </Text>
          <Image source={icons.hero} style={styles.heroImage} resizeMode="contain" />
          <FigmaUtilityBar s={s} />

          <View style={styles.tabRow}>
            {periodTabs.map((tab, index) => (
              <Pressable key={tab} style={[styles.tabButton, index === 0 && styles.tabButtonActive]}>
                <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TOP 20 RANKING</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={icons.sectionChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        {rankings.map((entry) => (
          <View key={entry.key} style={[styles.rankCard, entry.highlight && styles.rankCardHighlight]}>
            <Text style={styles.rankNumber}>{entry.rank}</Text>
            <Image source={entry.avatar} style={styles.rankPortrait} resizeMode="contain" />
            <View style={styles.rankCenter}>
              <Text style={styles.rankName}>{entry.name}</Text>
              <Text style={styles.rankRole}>{entry.role}</Text>
            </View>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsValue}>{entry.points}</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
            </View>
          </View>
        ))}

        <View style={styles.ctaCard}>
          <Image source={icons.ctaTrophy} style={styles.ctaIcon} resizeMode="contain" />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>LEARN, PARTICIPATE, EARN.</Text>
            <Text style={styles.ctaBody}>
              Each month, 1st place earns sealed product, classic game-used cards, and cash.
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
      minHeight: s(420),
      marginBottom: s(8)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(16),
      fontSize: t(48),
      lineHeight: t(72),
      color: '#2f302f',
      letterSpacing: -1,
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
      fontSize: t(21),
      lineHeight: t(26),
      color: '#5e5f60',
      width: s(320)
    },
    description: {
      marginTop: s(18),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      lineHeight: t(24),
      color: '#727475',
      width: s(360)
    },
    heroImage: {
      position: 'absolute',
      right: s(20),
      top: s(60),
      width: s(327),
      height: s(350)
    },
    tabRow: {
      marginTop: s(24),
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(12)
    },
    tabButton: {
      minWidth: s(150),
      height: s(42),
      borderRadius: s(21),
      borderWidth: 1,
      borderColor: '#f0ece7',
      backgroundColor: '#ede9e3',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(16)
    },
    tabButtonActive: {
      backgroundColor: '#1b2326',
      borderColor: '#343b3f'
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: '#6d6d6c'
    },
    tabTextActive: {
      color: '#9fa2a4'
    },
    sectionHeaderRow: {
      marginTop: s(10),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(26),
      color: '#2b3034'
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
      width: s(12),
      height: s(19)
    },
    rankCard: {
      backgroundColor: '#f8f7f5',
      borderWidth: 1,
      borderColor: '#f0eeed',
      minHeight: s(120),
      marginBottom: s(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(8),
      paddingVertical: s(8)
    },
    rankCardHighlight: {
      borderColor: '#d2b391',
      borderRadius: s(10),
      backgroundColor: '#f9f7f5'
    },
    rankNumber: {
      width: s(40),
      fontFamily: 'Inter_700Bold',
      fontSize: t(24),
      color: '#2e3030',
      textAlign: 'center'
    },
    rankPortrait: {
      width: s(101),
      height: s(99),
      marginRight: s(6)
    },
    rankCenter: {
      flex: 1,
      gap: s(4)
    },
    rankName: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(19),
      color: '#515354'
    },
    rankRole: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(14),
      color: '#757678'
    },
    pointsPill: {
      width: s(178),
      height: s(51),
      borderRadius: s(23),
      backgroundColor: '#ede8e2',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6)
    },
    pointsValue: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(24),
      color: '#323434'
    },
    pointsLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(16),
      color: '#636462'
    },
    ctaCard: {
      minHeight: s(116),
      borderRadius: s(15),
      borderWidth: 2,
      borderColor: '#eae7e4',
      backgroundColor: '#f6f4f2',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(12)
    },
    ctaIcon: {
      width: s(123),
      height: s(100)
    },
    ctaTextWrap: {
      flex: 1,
      paddingHorizontal: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(22),
      color: '#2c2f30',
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(22),
      color: '#717375'
    },
    ctaArrow: {
      width: s(39),
      height: s(27)
    }
  });
}
