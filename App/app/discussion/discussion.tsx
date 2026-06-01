import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DiscussionThreadCard } from '@/components/figma/DiscussionThreadCard';
import { DiscussionTopicCard } from '@/components/figma/DiscussionTopicCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import {
  discussionIcons,
  discussionTabs,
  discussionThreads,
  discussionTopics
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function DiscussionScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={[page.title, styles.title]}>DISCUSSION</Text>
        <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />

        <View style={styles.headerBody}>
          <View style={styles.headerText}>
            <Text style={[page.subtitle, styles.subtitle]}>HOBBY TALK WITHOUT THE DRAMA.</Text>
            <Text style={[page.description, styles.description]}>
              Engage with the newest evidence, discuss past and future research findings, and align yourself
              with the hobby's best and brightest.
            </Text>
          </View>
        </View>

        <Image source={discussionIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[page.tabRow, styles.tabRow]}
        >
          {discussionTabs.map((tab, index) => (
            <Pressable key={tab} style={[page.tabButton, index === 0 && page.tabButtonActive]}>
              <Text style={[page.tabText, index === 0 && page.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>TOPICS</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={discussionIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {discussionTopics.map(({ key, ...topic }) => (
        <DiscussionTopicCard key={key} {...topic} s={s} t={t} />
      ))}

      <View style={[page.sectionHeaderRow, styles.sectionSpaced]}>
        <Text style={page.sectionTitle}>ACTIVE THREADS</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={discussionIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {discussionThreads.map(({ key, ...thread }) => (
        <DiscussionThreadCard key={key} {...thread} s={s} t={t} />
      ))}

      <View style={page.ctaCard}>
        <Image source={discussionIcons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>THREADING THE NEEDLE.</Text>
          <Text style={page.ctaBody}>
            Share what you know, question what you don't, and help the hobby get smarter.
          </Text>
        </View>
        <Image source={discussionIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    headerSection: {
      minHeight: s(440),
      paddingRight: s(88)
    },
    title: {
      width: '100%',
      alignSelf: 'flex-start',
      lineHeight: t(58),
      marginTop: s(12)
    },
    titleBrush: {
      width: '92%',
      maxWidth: s(480),
      height: s(33),
      marginTop: s(10),
      marginLeft: s(2)
    },
    headerBody: {
      flexDirection: 'row',
      alignItems: 'flex-start'
    },
    headerText: {
      flex: 1,
      minWidth: 0,
      maxWidth: s(420),
      paddingRight: s(8),
      zIndex: 1
    },
    subtitle: {
      marginTop: s(22)
    },
    description: {
      marginTop: s(20),
      width: '100%'
    },
    heroImage: {
      position: 'absolute',
      right: s(88),
      top: s(60),
      width: s(286),
      height: s(310)
    },
    tabRow: {
      flexWrap: 'nowrap',
      gap: s(14)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: 15,
      color: figmaColors.gray
    },
    sectionSpaced: {
      marginTop: s(4)
    }
  });
}
