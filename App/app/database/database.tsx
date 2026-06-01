import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import {
  databaseFeaturedRecords,
  databaseIcons,
  databaseRecentRecords,
  databaseSportTabs
} from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function DatabaseScreen() {
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s), [s]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="database" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={page.title}>DATABASE</Text>
        <Image source={figmaSharedIcons.titleBrush} style={page.titleBrush} resizeMode="stretch" />
        <Text style={page.subtitle}>A HISTORY OF HISTORY.</Text>
        <Text style={page.description}>
          Browse authenticated cards, patch examples, provenance notes, and research evidence from across
          the hobby.
        </Text>
        <Image source={databaseIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={page.tabRow}>
          {databaseSportTabs.map((tab, index) => (
            <Pressable key={tab} style={[page.tabButton, index === 0 && page.tabButtonActive]}>
              <Text style={[page.tabText, index === 0 && page.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>FEATURED RECORDS</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {databaseFeaturedRecords.map((record) => (
        <DatabaseRecordCard
          key={record.key}
          cardImage={record.cardImage}
          title={record.title}
          description={record.description}
          tags={record.tags}
          meta={record.meta}
          variant="featured"
          s={s}
          t={t}
        />
      ))}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>RECENTLY ADDED</Text>
        <View style={page.viewAllRow}>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
          <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </View>
      </View>

      {databaseRecentRecords.map((record) => (
        <DatabaseRecordCard
          key={record.key}
          cardImage={record.cardImage}
          title={record.title}
          description={record.description}
          tags={record.tags}
          meta={record.meta}
          variant="featured"
          s={s}
          t={t}
        />
      ))}

      <View style={styles.ctaCard}>
        <Image source={databaseIcons.ctaRecords} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={styles.ctaTitle}>AUTHENTICATION TAKES OBSESSION.</Text>
          <Text style={styles.ctaBody}>
            Learn how to authenticate game-used cards, contribute to the conversation, and win monthly
            prizes.
          </Text>
        </View>
        <Image source={databaseIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number) {
  return StyleSheet.create({
    headerSection: {
      minHeight: s(380)
    },
    heroImage: {
      position: 'absolute',
      right: s(70),
      top: s(28),
      width: s(279),
      height: s(268)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: 15,
      color: figmaColors.gray
    },
    ctaCard: {
      minHeight: s(108),
      borderRadius: s(12),
      backgroundColor: '#f7f3ed',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: 17,
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: 18,
      lineHeight: 20,
      color: figmaColors.gray
    }
  });
}
