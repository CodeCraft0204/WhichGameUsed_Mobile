import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
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
  const [activeTab, setActiveTab] = useState<(typeof mostWantedSportTabs)[number]>(
    mostWantedSportTabs[0]
  );

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="mostwanted" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <FigmaPageHeader
        title="MOST WANTED"
        subtitle="VOTE THE HOBBY'S BIGGEST MYSTERIES TO THE TOP."
        description="Track the 20 game-used cards collectors most want authenticated. Vote with likes and dislikes, discuss leads, and earn bounties for evidence that helps prove a card."
        heroSource={mostWantedIcons.hero}
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(mostWantedSportTabs)}
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
