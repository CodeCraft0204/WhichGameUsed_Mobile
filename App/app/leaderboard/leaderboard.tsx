import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
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
  return (
    <ContextHeaderScrollProvider>
      <LeaderboardScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function LeaderboardScreenBody() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<(typeof leaderboardPeriodTabs)[number]>(
    leaderboardPeriodTabs[0]
  );
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="leaderboard" />}
      scrollProps={scrollProps}
    >
      <FigmaPageHeader
        title="LEADERBOARD"
        subtitle="THE HOBBY'S LEADING EXPERTS IN RABBIT HOLES."
        description="Track the top 20 users on the platform each month. Rankings are based on a points system that rewards strong authentication work, helpful participation, and research contributions."
        heroSource={leaderboardIcons.hero}
        guidanceKey="leaderboard"
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(leaderboardPeriodTabs)}
          value={activeTab}
          onChange={setActiveTab}
          s={s}
          t={t}
          style={styles.chipRow}
        />      </FigmaPageHeader>

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
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
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
