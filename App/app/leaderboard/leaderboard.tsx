import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { LeaderboardRankCard } from '@/components/figma/LeaderboardRankCard';
import {
  leaderboardIcons,
  leaderboardPeriodTabs,
  leaderboardRanks
} from '@/constants/leaderboardContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function LeaderboardScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="leaderboard" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <FigmaPageHeader
        title="LEADERBOARD"
        subtitle="THE HOBBY'S LEADING EXPERTS IN RABBIT HOLES."
        description="Track the top 20 users on the platform each month. Rankings are based on a points system that rewards strong authentication work, helpful participation, and research contributions."
        heroSource={leaderboardIcons.hero}
        s={s}
        page={page}
      >
        <View style={styles.tabRow}>
          {leaderboardPeriodTabs.map((tab, index) => (
            <Pressable
              key={tab}
              style={[styles.tabButton, index === 0 && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </FigmaPageHeader>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>TOP 20 RANKING</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={figmaSharedIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {leaderboardRanks.map(({ key, ...entry }) => (
        <LeaderboardRankCard key={key} {...entry} s={s} t={t} />
      ))}

      <View style={page.ctaCard}>
        <Image source={leaderboardIcons.ctaTrophy} style={styles.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>LEARN, PARTICIPATE, EARN.</Text>
          <Text style={page.ctaBody}>
            Each month, 1st place earns sealed product, classic game-used cards, and cash.
          </Text>
        </View>
        <Image source={leaderboardIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
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
      paddingHorizontal: s(6)
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
