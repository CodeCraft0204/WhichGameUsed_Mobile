import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/education/hero_illustration.png'),
  guideFakePatches: require('@/assets/figma/education/guide_fake_patches.png'),
  guideBeckett: require('@/assets/figma/education/guide_beckett.png'),
  guideHobbyHistory: require('@/assets/figma/education/guide_hobby_history.png'),
  pdfIcon: require('@/assets/figma/education/pdf_icon.png'),
  videoEbay: require('@/assets/figma/education/video_thumb_ebay.png'),
  videoBeckett: require('@/assets/figma/education/video_thumb_beckett.png'),
  videoPatch: require('@/assets/figma/education/video_thumb_patch.png'),
  playButton: require('@/assets/figma/education/play_button.png'),
  ctaShield: require('@/assets/figma/education/cta_shield.png'),
  ctaArrow: require('@/assets/figma/education/cta_arrow.png'),
  menuDots: require('@/assets/figma/education/menu_dots.png')
};

const tabs = ['ALL', 'AUTHENTICATION', 'PHOTO MATCHING', 'IDENTIFYING FAKES', 'SOURCES'] as const;

const guides = [
  {
    key: 'patches',
    image: icons.guideFakePatches,
    title: 'Identifying Fake\nPatches',
    description: 'Spot altered swatches, manufactured patches, and other memorabilia red flags.',
    meta: '24 PAGES • BEGINNER'
  },
  {
    key: 'beckett',
    image: icons.guideBeckett,
    title: 'Reading Beckett &\nAuction Catalogs',
    description: 'Use hobby publications and old sales catalogs as research sources.',
    meta: '18 PAGES • INTERMEDIATE'
  },
  {
    key: 'history',
    image: icons.guideHobbyHistory,
    title: 'Making Hobby\nHistory',
    description: 'Build timelines, provenance, and player-worn evidence from the record.',
    meta: '16 PAGES • ALL LEVELS'
  }
];

const videos = [
  {
    key: 'ebay',
    thumb: icons.videoEbay,
    title: 'Browsing eBay for Counterfeit\nGame-Used Cards',
    channel: 'Which Game Used',
    duration: '12:45',
    platform: 'YouTube'
  },
  {
    key: 'beckett',
    thumb: icons.videoBeckett,
    title: 'How to Read Beckett Like\na Researcher',
    channel: 'Hobby Archive',
    duration: '8:32',
    platform: 'YouTube'
  },
  {
    key: 'patch',
    thumb: icons.videoPatch,
    title: 'Patch Authentication Basics',
    channel: 'Collector Classroom',
    duration: '10:21',
    platform: 'Instagram'
  }
];

export default function EducationScreen() {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      bottomNav={<FigmaHubBottomNav active="education" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: styles.scrollContent }}
    >
        <View style={styles.headerSection}>
          <Text style={styles.title}>EDUCATION</Text>
          <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>LEARN THE HOBBY. SPOT THE FAKES.</Text>
          <Text style={styles.description}>
            Explore guides, videos, and research tools that help collectors study game-used cards,
            identify fakes, and build evidence with confidence.
          </Text>
          <Image source={icons.hero} style={styles.heroImage} resizeMode="contain" />
          <FigmaUtilityBar s={s} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {tabs.map((tab, index) => (
              <Pressable key={tab} style={[styles.tabButton, index === 0 && styles.tabButtonActive]}>
                <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>FEATURED GUIDES (PDF)</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={figmaSharedIcons.sectionChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.guideRow}>
          {guides.map((guide) => (
            <View key={guide.key} style={styles.guideCard}>
              <View style={styles.guidePdfRow}>
                <Image source={icons.pdfIcon} style={styles.pdfIcon} resizeMode="contain" />
                <Text style={styles.pdfLabel}>PDF</Text>
              </View>
              <Image source={guide.image} style={styles.guideImage} resizeMode="contain" />
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideDescription}>{guide.description}</Text>
              <Text style={styles.guideMeta}>{guide.meta}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>FEATURED VIDEOS</Text>
          <View style={styles.viewAllRow}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
            <Image source={figmaSharedIcons.sectionChevron} style={styles.sectionChevron} resizeMode="contain" />
          </View>
        </View>

        {videos.map((video) => (
          <View key={video.key} style={styles.videoRow}>
            <View style={styles.videoThumbWrap}>
              <Image source={video.thumb} style={styles.videoThumb} resizeMode="cover" />
              <Image source={icons.playButton} style={styles.playButton} resizeMode="contain" />
            </View>
            <View style={styles.videoCenter}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoChannel}>{video.channel}</Text>
              <Text style={styles.videoDuration}>{video.duration}</Text>
            </View>
            <View style={styles.videoRight}>
              <Text style={styles.videoPlatform}>{video.platform}</Text>
              <Image source={icons.menuDots} style={styles.menuDots} resizeMode="contain" />
            </View>
          </View>
        ))}

        <View style={styles.ctaCard}>
          <Image source={icons.ctaShield} style={styles.ctaIcon} resizeMode="contain" />
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>KNOWLEDGE PROTECTS COLLECTORS.</Text>
            <Text style={styles.ctaBody}>The more you learn, the harder it is to fool you.</Text>
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
      minHeight: s(400),
      marginBottom: s(8)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(16),
      fontSize: t(50),
      lineHeight: t(80),
      color: '#2f302f',
      letterSpacing: -0.5,
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
      marginTop: s(22),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      lineHeight: t(26),
      color: '#7c7c7b',
      width: s(340)
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
      right: s(100),
      top: s(40),
      width: s(210),
      height: s(226)
    },
    tabRow: {
      marginTop: s(28),
      gap: s(12),
      paddingRight: s(8)
    },
    tabButton: {
      minWidth: s(110),
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
      fontSize: t(24),
      color: '#585858'
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      color: '#929291'
    },
    sectionChevron: {
      width: s(10),
      height: s(17)
    },
    guideRow: {
      gap: s(12),
      paddingBottom: s(8)
    },
    guideCard: {
      width: s(230),
      minHeight: s(367),
      backgroundColor: '#f3f0ea',
      borderWidth: 1,
      borderColor: '#e4dfda',
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingBottom: s(12)
    },
    guidePdfRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(10)
    },
    pdfIcon: {
      width: s(33),
      height: s(38)
    },
    pdfLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(11),
      color: '#9b8c7c'
    },
    guideImage: {
      width: '100%',
      height: s(148),
      marginTop: s(4)
    },
    guideTitle: {
      marginTop: s(8),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(22),
      lineHeight: t(28),
      color: '#5d5c5c'
    },
    guideDescription: {
      marginTop: s(8),
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(21),
      color: '#989795'
    },
    guideMeta: {
      marginTop: s(10),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(13),
      color: '#9a9997'
    },
    videoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(14),
      gap: s(10)
    },
    videoThumbWrap: {
      width: s(242),
      height: s(104),
      justifyContent: 'center',
      alignItems: 'center'
    },
    videoThumb: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: s(8)
    },
    playButton: {
      width: s(40),
      height: s(40)
    },
    videoCenter: {
      flex: 1,
      gap: s(4)
    },
    videoTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      lineHeight: t(22),
      color: '#828281'
    },
    videoChannel: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      color: '#969595'
    },
    videoDuration: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      color: '#979796'
    },
    videoRight: {
      alignItems: 'flex-end',
      gap: s(8),
      minWidth: s(72)
    },
    videoPlatform: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(15),
      color: '#8a8989'
    },
    menuDots: {
      width: s(21),
      height: s(5)
    },
    ctaCard: {
      minHeight: s(74),
      borderRadius: s(16),
      borderWidth: 1,
      borderColor: '#e6e3de',
      backgroundColor: '#f2efe9',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(8)
    },
    ctaIcon: {
      width: s(44),
      height: s(52)
    },
    ctaTextWrap: {
      flex: 1,
      paddingHorizontal: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(18),
      color: '#646463',
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      color: '#908f8d'
    },
    ctaArrow: {
      width: s(32),
      height: s(21)
    }
  });
}
