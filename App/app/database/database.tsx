import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/database/hero_archive.png'),
  recordMantle: require('@/assets/figma/database/record_mantle.png'),
  recordJordan: require('@/assets/figma/database/record_jordan.png'),
  recordRuth: require('@/assets/figma/database/record_ruth.png'),
  recentKobe: require('@/assets/figma/database/recent_kobe.png'),
  recentGehrig: require('@/assets/figma/database/recent_gehrig.png'),
  ctaRecords: require('@/assets/figma/database/cta_records.png'),
  ctaArrow: require('@/assets/figma/database/cta_arrow.png'),
  cardChevron: require('@/assets/figma/database/card_chevron.png')
};

const sportTabs = ['ALL', 'BASEBALL', 'BASKETBALL', 'FOOTBALL', 'PLAYERS'] as const;

const featuredRecords = [
  {
    key: 'mantle',
    image: icons.recordMantle,
    title: '1952 Topps Mickey Mantle\nRelic File',
    description:
      'Featured record with verification timeline, patch notes, provenance trail, and source links.',
    player: 'Mickey Mantle',
    team: 'New York Yankees',
    year: '1952',
    auth: 'PSA/DNA',
    tags: ['PLAYER', 'VINTAGE']
  },
  {
    key: 'jordan',
    image: icons.recordJordan,
    title: 'Michael Jordan\nPatch Comparison',
    description: 'Side-by-side patch study with stitch analysis, card history, and collector notes.',
    player: 'Michael Jordan',
    team: 'Chicago Bulls',
    year: '1997-98',
    auth: 'Beckett Auth.',
    tags: ['PLAYER', 'BASKETBALL', 'RESEARCH']
  },
  {
    key: 'ruth',
    image: icons.recordRuth,
    title: 'Babe Ruth Bat Relic Archive',
    description: 'Source images, auction references, and authentication commentary gathered in one record.',
    player: 'Babe Ruth',
    team: 'New York Yankees',
    year: '1930s',
    auth: 'JSA',
    tags: ['BAT RELIC', 'BASEBALL', 'SOURCES']
  }
];

const recentRecords = [
  {
    key: 'kobe',
    image: icons.recentKobe,
    title: 'Kobe Bryant Memorabilia Index',
    description: 'Comprehensive index of game-used cards, patches, and related collector resources.',
    year: '2005-2016',
    auth: 'Multiple Labs'
  },
  {
    key: 'gehrig',
    image: icons.recentGehrig,
    title: 'Lou Gehrig Provenance Notes',
    description: 'Early provenance research with archival references and authentication notes.',
    year: '1930s',
    auth: 'JSA'
  }
];

export default function DatabaseScreen() {
  const { s, t } = useFigmaLayout(0.55);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor="#faf6f1"
      bottomNav={<FigmaDatabaseBottomNav active="database" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: styles.scrollContent }}
    >
        <View style={styles.headerSection}>
          <Text style={styles.title}>DATABASE</Text>
          <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>A HISTORY OF HISTORY.</Text>
          <Text style={styles.description}>
            Browse authenticated cards, patch examples, provenance notes, and research evidence from across
            the hobby.
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
          <Text style={styles.sectionTitle}>FEATURED RECORDS</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={icons.cardChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        {featuredRecords.map((record) => (
          <View key={record.key} style={styles.recordCard}>
            <Image source={record.image} style={styles.recordImage} resizeMode="contain" />
            <View style={styles.recordBody}>
              <Text style={styles.recordTitle}>{record.title}</Text>
              <Text style={styles.recordDescription}>{record.description}</Text>
              <View style={styles.tagRow}>
                {record.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.recordMeta}>
              <Text style={styles.metaLine}>{record.player}</Text>
              <Text style={styles.metaLine}>{record.team}</Text>
              <Text style={styles.metaLine}>{record.year}</Text>
              <Text style={styles.metaLine}>{record.auth}</Text>
              <Image source={icons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
            </View>
          </View>
        ))}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENTLY ADDED</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={icons.cardChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        {recentRecords.map((record) => (
          <View key={record.key} style={styles.recentCard}>
            <Image source={record.image} style={styles.recentImage} resizeMode="contain" />
            <View style={styles.recentBody}>
              <Text style={styles.recentTitle}>{record.title}</Text>
              <Text style={styles.recentDescription}>{record.description}</Text>
            </View>
            <View style={styles.recentMeta}>
              <Text style={styles.metaLine}>{record.year}</Text>
              <Text style={styles.metaLine}>{record.auth}</Text>
            </View>
          </View>
        ))}

        <View style={styles.ctaCard}>
          <Image source={icons.ctaRecords} style={styles.ctaIcon} resizeMode="contain" />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>AUTHENTICATION TAKES OBSESSION.</Text>
            <Text style={styles.ctaBody}>
              Learn how to authenticate game-used cards, contribute to the conversation, and win monthly
              prizes.
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
      paddingHorizontal: s(16),
      paddingTop: s(14),
      paddingBottom: s(16)
    },
    headerSection: {
      position: 'relative',
      minHeight: s(340),
      marginBottom: s(8)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(12),
      fontSize: t(50),
      lineHeight: t(62),
      color: '#2f302f',
      transform: [{ rotate: '-2deg' }],
      width: s(280)
    },
    titleBrush: {
      width: s(288),
      height: s(26),
      marginTop: s(-10)
    },
    subtitle: {
      marginTop: s(16),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(19),
      color: '#6a6969'
    },
    description: {
      marginTop: s(14),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      lineHeight: t(21),
      color: '#818180',
      width: s(300)
    },
    heroImage: {
      position: 'absolute',
      right: s(80),
      top: s(20),
      width: s(279),
      height: s(268)
    },
    tabRow: {
      marginTop: s(20),
      gap: s(10),
      paddingRight: s(8)
    },
    tabButton: {
      minWidth: s(100),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: '#e6e1db',
      backgroundColor: '#f9f6f1',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(12)
    },
    tabButtonActive: {
      backgroundColor: '#222222',
      borderColor: '#292728'
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      color: '#747473'
    },
    tabTextActive: {
      color: '#969897'
    },
    sectionHeaderRow: {
      marginTop: s(12),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#ece7e2',
      paddingTop: s(10)
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(22),
      color: '#3a3a3a'
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    viewAllText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(14),
      color: '#757575'
    },
    sectionChevron: {
      width: s(9),
      height: s(16)
    },
    recordCard: {
      backgroundColor: '#f9f6f1',
      borderWidth: 1,
      borderColor: '#ebe7e3',
      borderRadius: s(16),
      minHeight: s(185),
      marginBottom: s(10),
      flexDirection: 'row',
      padding: s(10),
      gap: s(8)
    },
    recordImage: {
      width: s(151),
      height: s(154)
    },
    recordBody: {
      flex: 1,
      gap: s(6)
    },
    recordTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(19),
      lineHeight: t(26),
      color: '#5e5e5d'
    },
    recordDescription: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      lineHeight: t(20),
      color: '#8c8c8b'
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: s(4)
    },
    tag: {
      backgroundColor: '#eee8df',
      borderWidth: 1,
      borderColor: '#f6f2ec',
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    tagText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(10),
      color: '#72706d'
    },
    recordMeta: {
      width: s(120),
      justifyContent: 'center',
      gap: s(8),
      paddingLeft: s(4)
    },
    metaLine: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      color: '#878786'
    },
    cardChevron: {
      width: s(8),
      height: s(15),
      alignSelf: 'flex-end',
      marginTop: s(8)
    },
    recentCard: {
      backgroundColor: '#f9f6f0',
      borderWidth: 7,
      borderColor: '#eeeae6',
      borderRadius: s(18),
      minHeight: s(158),
      marginBottom: s(10),
      flexDirection: 'row',
      padding: s(10),
      gap: s(8)
    },
    recentImage: {
      width: s(140),
      height: s(91)
    },
    recentBody: {
      flex: 1,
      gap: s(6)
    },
    recentTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: '#767574'
    },
    recentDescription: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      lineHeight: t(17),
      color: '#959594'
    },
    recentMeta: {
      width: s(100),
      justifyContent: 'center',
      gap: s(8)
    },
    ctaCard: {
      minHeight: s(110),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: '#e8e4df',
      backgroundColor: '#f6f4f2',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(8)
    },
    ctaIcon: {
      width: s(164),
      height: s(114)
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
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(15),
      lineHeight: t(20),
      color: '#848586'
    },
    ctaArrow: {
      width: s(37),
      height: s(27)
    }
  });
}
