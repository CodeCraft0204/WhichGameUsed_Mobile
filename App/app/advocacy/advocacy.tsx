import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DESIGN_WIDTH = 810;

const icons = {
  utilitySearch: require('@/assets/figma/advocacy/utility_search.png'),
  utilityProfile: require('@/assets/figma/advocacy/utility_profile.png'),
  utilitySettings: require('@/assets/figma/advocacy/utility_settings.png'),
  hero: require('@/assets/figma/advocacy/hero_illustration.png'),
  titleBrush: require('@/assets/figma/advocacy/title_brush.png'),
  petitionPanini: require('@/assets/figma/advocacy/petition_panini.png'),
  petitionTopps: require('@/assets/figma/advocacy/petition_topps.png'),
  petitionFanatics: require('@/assets/figma/advocacy/petition_fanatics.png'),
  ctaIcon: require('@/assets/figma/advocacy/cta_icon.png'),
  ctaArrow: require('@/assets/figma/advocacy/section_chevron.png'),
  navReturn: require('@/assets/figma/advocacy/nav_return.png'),
  navEducation: require('@/assets/figma/advocacy/nav_education.png'),
  navMostwanted: require('@/assets/figma/advocacy/nav_mostwanted.png'),
  navLeaderboard: require('@/assets/figma/advocacy/nav_leaderboard.png'),
  navAdvocacy: require('@/assets/figma/advocacy/nav_advocacy.png')
};

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
  const { width } = useWindowDimensions();
  const layoutScale = Math.min(width / DESIGN_WIDTH, 0.65);
  const textScale = Math.max(0.7, layoutScale);
  const s = (value: number) => Math.round(value * layoutScale);
  const t = (value: number) => Math.round(value * textScale);
  const styles = useMemo(() => createStyles(s, t), [layoutScale, textScale]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>ADVOCACY</Text>
          <Image source={icons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>MORE TRANSPARENCY.{'\n'}MORE TRUST. BETTER HOBBY.</Text>
          <Text style={styles.description}>
            Sign petitions, raise your voice, and push the hobby toward transparency. Together, we can ask
            manufacturers to share the records collectors deserve.
          </Text>

          <Image source={icons.hero} style={styles.heroImage} resizeMode="contain" />

          <View style={styles.utilityBar}>
            <Image source={icons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
            <Image source={icons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
            <Image source={icons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
          </View>

          <View style={styles.tabRow}>
            <Pressable style={[styles.tabButton, styles.tabButtonActive]}>
              <Text style={[styles.tabText, styles.tabTextActive]}>ALL</Text>
            </Pressable>
            <Pressable style={styles.tabButton}>
              <Text style={styles.tabText}>ACTIVE</Text>
            </Pressable>
            <Pressable style={styles.tabButton}>
              <Text style={styles.tabText}>WINS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ACTVE PETITONS</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={icons.ctaArrow} style={styles.sectionChevron} resizeMode="contain" />
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

        <View style={styles.ctaCard}>
          <Image source={icons.ctaIcon} style={styles.ctaIcon} resizeMode="contain" />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>FULFILL YOUR CIVIC RESPONSIBILITY AND VOTE.</Text>
            <Text style={styles.ctaBody}>Transparency starts when collectors speak together.</Text>
          </View>
          <Image source={icons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Link href="/database/database" asChild>
          <Pressable style={styles.navItem}>
            <Image source={icons.navReturn} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>RETURN</Text>
          </Pressable>
        </Link>
        <Link href="/education/education" asChild>
          <Pressable style={styles.navItem}>
            <Image source={icons.navEducation} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>EDUCATION</Text>
          </Pressable>
        </Link>
        <Link href="/mostwanted/mostwanted" asChild>
          <Pressable style={styles.navItem}>
            <Image source={icons.navMostwanted} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>MOST WANTED</Text>
          </Pressable>
        </Link>
        <Link href="/leaderboard/leaderboard" asChild>
          <Pressable style={styles.navItem}>
            <Image source={icons.navLeaderboard} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.navText}>LEADERBOARD</Text>
          </Pressable>
        </Link>
        <Pressable style={styles.navItem}>
          <Image source={icons.navAdvocacy} style={styles.navIcon} resizeMode="contain" />
          <Text style={[styles.navText, styles.navTextActive]}>ADVOCACY</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f6f4f0'
    },
    scrollContent: {
      paddingHorizontal: s(20),
      paddingTop: s(14),
      paddingBottom: s(108)
    },
    headerSection: {
      position: 'relative',
      minHeight: s(420)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(16),
      fontSize: t(50),
      lineHeight: t(80),
      color: '#35393d',
      letterSpacing: 0.6,
      transform: [{ rotate: '-4deg' }],
      width: s(360)
    },
    titleBrush: {
      width: s(338),
      height: s(33),
      marginTop: s(-14),
      marginLeft: s(2)
    },
    subtitle: {
      marginTop: s(26),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      lineHeight: t(26),
      color: '#6d7074',
      width: s(340)
    },
    description: {
      marginTop: s(24),
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(20),
      lineHeight: t(26),
      color: '#898a8d',
      width: s(380)
    },
    heroImage: {
      position: 'absolute',
      right: s(84),
      top: s(36),
      width: s(288),
      height: s(338)
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
    tabRow: {
      marginTop: s(32),
      flexDirection: 'row',
      gap: s(18)
    },
    tabButton: {
      minWidth: s(124),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: '#b3a499',
      backgroundColor: '#fcf9f7',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tabButtonActive: {
      backgroundColor: '#292c30',
      borderColor: '#1a1b21'
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: '#8c8e91'
    },
    tabTextActive: {
      color: '#999b9e'
    },
    sectionHeaderRow: {
      marginTop: s(14),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#f1ece8',
      paddingTop: s(10)
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      marginVertical: s(16),
      fontSize: t(26),
      color: '#42454a'
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      color: '#838588'
    },
    sectionChevron: {
      marginLeft: s(12),
      width: s(10),
      height: s(17)
    },
    card: {
      backgroundColor: '#f6f4f1',
      borderWidth: 1,
      borderColor: '#e9e6e2',
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
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(22),
      lineHeight: t(26),
      color: '#626569'
    },
    cardDescription: {
      marginTop: s(6),
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(21),
      color: '#8f9092'
    },
    progressTrack: {
      marginTop: s(10),
      width: '96%',
      height: s(10),
      backgroundColor: '#d8d4d1',
      borderRadius: s(8)
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#9c8370',
      borderRadius: s(8)
    },
    goalText: {
      marginTop: s(8),
      fontFamily: 'Inter_700Bold',
      fontSize: t(15),
      color: '#7f8083'
    },
    cardRight: {
      width: s(178),
      borderLeftWidth: 1,
      borderLeftColor: '#ddd8d4',
      paddingLeft: s(14),
      justifyContent: 'center',
      alignItems: 'center',
      gap: s(4)
    },
    signatureNumber: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(32),
      lineHeight: t(46),
      color: '#3d4145'
    },
    signatureLabel: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      color: '#818487',
      marginBottom: s(8)
    },
    signButton: {
      width: s(178),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: '#4a4d50',
      backgroundColor: '#292d31',
      alignItems: 'center',
      justifyContent: 'center'
    },
    signButtonText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      color: '#a1a3a5'
    },
    ctaCard: {
      minHeight: s(116),
      borderRadius: s(15),
      borderWidth: 1,
      borderColor: '#e6e2df',
      backgroundColor: '#f3f0ec',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(10)
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
      fontSize: t(18),
      color: '#464a4e',
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(21),
      lineHeight: t(24),
      color: '#848586'
    },
    ctaArrow: {
      width: s(37),
      height: s(27),
      marginRight: s(6)
    },
    bottomNav: {
      position: 'absolute',
      marginBottom: s(16),
      left: s(6),
      right: s(6),
      bottom: 0,
      height: s(120),
      backgroundColor: '#f7f5f3',
      borderTopWidth: 1,
      borderColor: '#f3f1ef',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      width: s(160),
      gap: s(5)
    },
    navIcon: {
      width: s(60),
      height: s(60)
    },
    navText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(12),
      color: '#7e8082'
    },
    navTextActive: {
      color: '#b0927d'
    }
  });
}
