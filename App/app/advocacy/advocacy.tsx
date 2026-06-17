import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

import { figmaIcons } from '@/constants/figmaIcons';
import { figmaSharedIcons } from '@/constants/figmaShared';

const icons = {
  hero: require('@/assets/figma/advocacy/hero_illustration.png'),
  titleBrush: require('@/assets/figma/advocacy/title_brush.png'),
  petitionPanini: require('@/assets/figma/advocacy/petition_panini.png'),
  petitionTopps: require('@/assets/figma/advocacy/petition_topps.png'),
  petitionFanatics: require('@/assets/figma/advocacy/petition_fanatics.png'),
  ctaIcon: figmaIcons.megaphone,
  ctaArrow: require('@/assets/figma/advocacy/section_chevron.png')
};

const advocacyTabs = ['ALL', 'ACTIVE', 'WINS'] as const;

const petitions = [
  {
    key: 'panini',
    image: icons.petitionPanini,
    title: 'Ask Panini to Open Their Database of Game Used Memorabilia',
    description: 'Collectors deserve access to the source records behind game-used memorabilia cards.',
    goal: 'Goal 10,000',
    progress: 0.52,
    signatures: '6,284'
  },
  {
    key: 'topps',
    image: icons.petitionTopps,
    title: 'Ask Topps to Provide Images of Their Game-Used Memorabilia',
    description: 'Show collectors the memorabilia used, so the hobby can evaluate cards with better evidence.',
    goal: 'Goal 6,000',
    progress: 0.41,
    signatures: '3,912'
  },
  {
    key: 'fanatics',
    image: icons.petitionFanatics,
    title: "Fanatics Wants to Lead, We're Asking Them To",
    description: 'If Fanatics wants to lead the hobby, transparency should be part of the standard.',
    goal: 'Goal 5,000',
    progress: 0.47,
    signatures: '2,262'
  }
];

export default function AdvocacyScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<(typeof advocacyTabs)[number]>(advocacyTabs[0]);

  return (
    <FigmaScreen
      bottomNav={<FigmaHubBottomNav active="advocacy" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <FigmaPageHeader
        title="ADVOCACY"
        subtitle={'MORE TRANSPARENCY.\nMORE TRUST. BETTER HOBBY.'}
        description="Sign petitions, raise your voice, and push the hobby toward transparency. Together, we can ask manufacturers to share the records collectors deserve."
        heroSource={icons.hero}
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(advocacyTabs)}
          value={activeTab}
          onChange={setActiveTab}
          s={s}
          t={t}
          style={styles.chipRow}
        />      </FigmaPageHeader>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>ACTVE PETITONS</Text>
        <View style={page.viewAllRow}>
          <Text style={page.viewAllText}>VIEW ALL</Text>
          <Image source={icons.ctaArrow} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {petitions.map((petition) => (
        <View key={petition.key} style={styles.card}>
          <Image source={petition.image} style={styles.cardImage} resizeMode="contain" />
          <View style={styles.cardCenter}>
            <Text style={styles.cardTitle}>{petition.title}</Text>
            <Text style={styles.cardDescription}>{petition.description}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${petition.progress * 100}%` }]} />
            </View>
            <Text style={styles.goalText}>{petition.goal}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.signatureNumber}>{petition.signatures}</Text>
            <Text style={styles.signatureLabel}>SIGNATURES</Text>
            <Pressable style={styles.signButton}>
              <Text style={styles.signButtonText}>SIGN PETITION</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={page.ctaCard}>
        <Image source={icons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>FULFILL YOUR CIVIC RESPONSIBILITY AND VOTE.</Text>
          <Text style={page.ctaBody}>Transparency starts when collectors speak together.</Text>
        </View>
        <Image source={icons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
    },
    utilityBar: {
      position: 'absolute',
      right: 0,
      top: s(28),
      width: s(84),
      height: s(263),
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.utilityBar,
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    utilityIcon: {
      width: s(44),
      height: s(44)
    },
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      minHeight: s(224),
      marginBottom: s(10),
      flexDirection: 'row',
      paddingLeft: s(8),
      paddingRight: s(12),
      paddingVertical: s(10)
    },
    cardImage: {
      width: s(174),
      height: s(182),
      marginTop: s(8)
    },
    cardCenter: {
      flex: 1,
      paddingLeft: s(8),
      paddingRight: s(10),
      justifyContent: 'space-between'
    },
    cardTitle: {
      marginTop: s(2),
      fontFamily: appFonts.body,
      fontSize: tb(22),
      lineHeight: tb(26),
      color: figmaColors.charcoal
    },
    cardDescription: {
      marginTop: s(6),
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(21),
      color: figmaColors.gray
    },
    progressTrack: {
      marginTop: s(10),
      width: '96%',
      height: s(10),
      backgroundColor: figmaColors.progressTrack,
      borderRadius: s(8)
    },
    progressFill: {
      height: '100%',
      backgroundColor: figmaColors.progressFill,
      borderRadius: s(8)
    },
    goalText: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray
    },
    cardRight: {
      width: s(178),
      borderLeftWidth: 1,
      borderLeftColor: figmaColors.borderLight,
      paddingLeft: s(14),
      justifyContent: 'center',
      alignItems: 'center',
      gap: s(4)
    },
    signatureNumber: {
      fontFamily: appFonts.body,
      fontSize: tb(32),
      lineHeight: tb(46),
      color: figmaColors.charcoal
    },
    signatureLabel: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    signButton: {
      width: s(178),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.buttonPrimaryBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    signButtonText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.buttonPrimaryText
    }
  });
}
