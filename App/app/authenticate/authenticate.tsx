import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/authenticate/hero.png'),
  submission1: require('@/assets/figma/authenticate/submission_01.png'),
  submission2: require('@/assets/figma/authenticate/submission_02.png'),
  submission3: require('@/assets/figma/authenticate/submission_03.png'),
  scanned1: require('@/assets/figma/authenticate/scanned_01.png'),
  scanned2: require('@/assets/figma/authenticate/scanned_02.png'),
  scanButton: require('@/assets/figma/authenticate/scan_button.png'),
  ctaIcon: require('@/assets/figma/authenticate/cta_icon.png'),
  ctaArrow: require('@/assets/figma/authenticate/cta_arrow.png'),
  chevron: require('@/assets/figma/authenticate/chevron.png')
};

const tabs = ['SUBMISSIONS', 'IN PROGRESS', 'COMPLETED'] as const;
const submissions = [icons.submission1, icons.submission2, icons.submission3];
const scanned = [icons.scanned1, icons.scanned2];

export default function AuthenticateScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      bottomNav={<FigmaDatabaseBottomNav active="authenticate" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={page.headerSection}>
        <Text style={page.title}>AUTHENTICATE</Text>
        <Image source={figmaSharedIcons.titleBrush} style={page.titleBrush} resizeMode="stretch" />
        <Text style={page.subtitle}>SUBMIT YOUR CARDS WITHOUT SUBMITTING YOUR CARDS.</Text>
        <Text style={page.description}>
          Scan your collection of game-used cards. If your card has been authenticated in our database,
          simply submit for authentication and we will mail you a tamper-proof QR-linked label for FREE.
        </Text>
        <Image source={icons.hero} style={styles.heroImage} resizeMode="contain" />
        <View style={styles.utilityBar}>
          <Image source={figmaSharedIcons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
          <Image source={figmaSharedIcons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
          <Image source={figmaSharedIcons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
        </View>
        <View style={page.tabRow}>
          {tabs.map((tab, index) => (
            <Pressable key={tab} style={[page.tabButton, index === 0 && page.tabButtonActive]}>
              <Text style={[page.tabText, index === 0 && page.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>DRAFT SUBMISSIONS</Text>
        <View style={page.viewAllRow}>
          <Text style={page.viewAllText}>VIEW ALL</Text>
          <Image source={icons.chevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {submissions.map((row, index) => (
        <Image key={`sub-${index}`} source={row} style={styles.rowImage} resizeMode="contain" />
      ))}

      <View style={[page.sectionHeaderRow, styles.sectionSpaced]}>
        <Text style={page.sectionTitle}>RECENTLY SCANNED</Text>
        <View style={page.viewAllRow}>
          <Text style={page.viewAllText}>VIEW ALL</Text>
          <Image source={icons.chevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {scanned.map((row, index) => (
        <Image key={`scan-${index}`} source={row} style={styles.scannedRowImage} resizeMode="contain" />
      ))}

      <Pressable style={styles.scanButtonWrap}>
        <Image source={icons.scanButton} style={styles.scanButton} resizeMode="contain" />
      </Pressable>

      <View style={page.ctaCard}>
        <Image source={icons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>LET THE GAMES BEGIN.</Text>
          <Text style={page.ctaBody}>
            Scan your cards, see the evidence, and submit for a FREE tamper-proof QR-linked label.
          </Text>
        </View>
        <Image source={icons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    heroImage: {
      position: 'absolute',
      right: s(70),
      top: s(40),
      width: s(300),
      height: s(320)
    },
    utilityBar: {
      position: 'absolute',
      right: 0,
      top: s(28),
      width: s(84),
      height: s(263),
      borderRadius: s(18),
      backgroundColor: '#f2efea',
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    utilityIcon: {
      width: s(44),
      height: s(44)
    },
    rowImage: {
      width: '100%',
      height: s(185),
      marginBottom: s(8)
    },
    sectionSpaced: {
      marginTop: s(4)
    },
    scannedRowImage: {
      width: '100%',
      height: s(120),
      marginBottom: s(8)
    },
    scanButtonWrap: {
      marginVertical: s(12),
      alignItems: 'center'
    },
    scanButton: {
      width: '100%',
      height: s(72)
    }
  });
}
