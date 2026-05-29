import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

const icons = {
  hero: require('@/assets/figma/discussion/hero.png'),
  topic1: require('@/assets/figma/discussion/topic_01.png'),
  topic2: require('@/assets/figma/discussion/topic_02.png'),
  topic3: require('@/assets/figma/discussion/topic_03.png'),
  topic4: require('@/assets/figma/discussion/topic_04.png'),
  thread1: require('@/assets/figma/discussion/thread_01.png'),
  thread2: require('@/assets/figma/discussion/thread_02.png'),
  thread3: require('@/assets/figma/discussion/thread_03.png'),
  ctaIcon: require('@/assets/figma/discussion/cta_icon.png'),
  ctaArrow: require('@/assets/figma/discussion/cta_arrow.png'),
  chevron: require('@/assets/figma/discussion/chevron.png')
};

const tabs = ['NEWEST', 'ALL-TIME GREATS', 'HOTTEST'] as const;
const topics = [icons.topic1, icons.topic2, icons.topic3, icons.topic4];
const threads = [icons.thread1, icons.thread2, icons.thread3];

export default function DiscussionScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      bottomNav={<FigmaDatabaseBottomNav active="discussion" s={s} t={t} />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={page.headerSection}>
        <Text style={page.title}>DISCUSSION</Text>
        <Image source={figmaSharedIcons.titleBrush} style={page.titleBrush} resizeMode="stretch" />
        <Text style={page.subtitle}>HOBBY TALK WITHOUT THE DRAMA.</Text>
        <Text style={page.description}>
          Engage with the newest evidence, discuss past and future research findings, and align yourself
          with the hobby's best and brightest.
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
        <Text style={page.sectionTitle}>TOPICS</Text>
        <View style={page.viewAllRow}>
          <Text style={page.viewAllText}>VIEW ALL</Text>
          <Image source={icons.chevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {topics.map((topic, index) => (
        <Image key={`topic-${index}`} source={topic} style={styles.topicRow} resizeMode="contain" />
      ))}

      <View style={[page.sectionHeaderRow, styles.sectionSpaced]}>
        <Text style={page.sectionTitle}>ACTIVE THREADS</Text>
        <View style={page.viewAllRow}>
          <Text style={page.viewAllText}>VIEW ALL</Text>
          <Image source={icons.chevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {threads.map((thread, index) => (
        <Image key={`thread-${index}`} source={thread} style={styles.threadRow} resizeMode="contain" />
      ))}

      <View style={page.ctaCard}>
        <Image source={icons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>THREADING THE NEEDLE.</Text>
          <Text style={page.ctaBody}>
            Share what you know, question what you don't, and help the hobby get smarter.
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
      right: s(80),
      top: s(44),
      width: s(280),
      height: s(300)
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
    topicRow: {
      width: '100%',
      height: s(118),
      marginBottom: s(6)
    },
    sectionSpaced: {
      marginTop: s(4)
    },
    threadRow: {
      width: '100%',
      height: s(100),
      marginBottom: s(6)
    }
  });
}
