import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from 'react-native';
import { useRouter } from 'expo-router';
import { ContextScrollView } from '@/components/context-header/ContextScrollView';
import { EducationCaseStudyCard } from '@/components/figma/EducationCaseStudyCard';
import { EducationGuideCard } from '@/components/figma/EducationGuideCard';
import { EducationToolCard } from '@/components/figma/EducationToolCard';
import { EducationVideoCard } from '@/components/figma/EducationVideoCard';
import { FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { ContextHeaderScrollProvider } from '@/context/ContextHeaderScrollContext';
import { useRegisterUtilitySearch } from '@/context/UtilitySearchContext';
import {
  educationBrowseTypes,
  educationCaseStudies,
  educationGuides,
  educationIcons,
  educationJerseySports,
  educationQuickFilterLabels,
  educationQuickFilters,
  educationTools,
  educationVideos,
  featuredPublications,
  guidesForTopic,
  searchEducationLibrary,
  videosForTopic,
  type EducationBrowseType,
  type EducationCaseStudyCta,
  type EducationFeaturedItem,
  type EducationGuide,
  type EducationQuickFilter,
  type EducationVideo
} from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';
import {
  authenticateHref,
  databaseWishlistHref,
  discussionHref,
  educationGuideOutlineHref,
  mostWantedHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    // Ignore — device may not handle the scheme.
  }
}

function SectionTitle({
  title,
  page
}: {
  title: string;
  page: ReturnType<typeof createFigmaPageStyles>;
}) {
  return (
    <View style={page.sectionHeaderRow}>
      <Text style={page.sectionTitle}>{title}</Text>
    </View>
  );
}

export default function EducationScreen() {
  return (
    <ContextHeaderScrollProvider>
      <EducationScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function EducationScreenBody() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<EducationQuickFilter>('ALL');
  const [jerseySport, setJerseySport] = useState<(typeof educationJerseySports)[number] | null>(
    null
  );
  const [toolbarStuck, setToolbarStuck] = useState(false);
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const searchInputRef = useRef<TextInput>(null);
  const sectionY = useRef<Record<string, number>>({});
  const toolbarHeight = useRef(0);
  const toolbarAnchorY = useRef(0);

  useRegisterUtilitySearch(() => {
    searchInputRef.current?.focus();
  });

  const onSectionLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      sectionY.current[key] = e.nativeEvent.layout.y;
    },
    []
  );

  const onToolbarLayout = useCallback((e: LayoutChangeEvent) => {
    toolbarHeight.current = e.nativeEvent.layout.height;
    // While floating in-flow, capture anchor Y. When stuck, layout.y collapses toward 0.
    if (e.nativeEvent.layout.y > 1) {
      toolbarAnchorY.current = e.nativeEvent.layout.y;
    }
  }, []);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const stuck = toolbarAnchorY.current > 0 && y >= toolbarAnchorY.current - 1;
    setToolbarStuck((prev) => (prev === stuck ? prev : stuck));
  }, []);

  const scrollToSection = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (typeof y === 'number') {
      const offset = toolbarHeight.current + 8;
      scrollRef.current?.scrollTo({ y: Math.max(y - offset, 0), animated: true });
    }
  }, []);

  const onQuickFilter = useCallback(
    (filter: EducationQuickFilter) => {
      setActiveFilter(filter);
      setQuery('');
      if (filter === 'ALL') return;
      const map: Record<Exclude<EducationQuickFilter, 'ALL'>, string> = {
        PDFS: 'pdfs',
        VIDEOS: 'videos',
        JERSEY: 'jersey',
        CASES: 'cases',
        TOOLS: 'tools'
      };
      requestAnimationFrame(() => scrollToSection(map[filter]));
    },
    [scrollToSection]
  );

  const onBrowseType = useCallback(
    (browse: EducationBrowseType) => {
      setActiveFilter(browse.filter);
      setQuery('');
      requestAnimationFrame(() => scrollToSection(browse.sectionId));
    },
    [scrollToSection]
  );

  const openGuide = useCallback(
    (guide: EducationGuide) => {
      if (guide.outlineSlug) {
        router.push(educationGuideOutlineHref(guide.outlineSlug));
        return;
      }
      if (guide.href) void openExternal(guide.href);
    },
    [router]
  );

  const openVideo = useCallback((video: EducationVideo) => {
    if (video.href) void openExternal(video.href);
  }, []);

  const openCaseCta = useCallback(
    (target: EducationCaseStudyCta) => {
      switch (target) {
        case 'mostwanted':
          router.push(mostWantedHref());
          return;
        case 'discussion':
          router.push(discussionHref());
          return;
        case 'wishlist':
          router.push(databaseWishlistHref());
          return;
        case 'authenticate':
          router.push(authenticateHref());
          return;
        case 'database':
          router.push('/database/database');
          return;
      }
    },
    [router]
  );

  const isSearching = query.trim().length > 0;
  const library = useMemo(() => searchEducationLibrary(query), [query]);
  const featured = useMemo(() => featuredPublications(), []);
  const beginnerGuides = guidesForTopic('beginner');
  const intermediateGuides = guidesForTopic('intermediate');
  const fraudGuides = guidesForTopic('fraud');
  const fraudVideos = videosForTopic('fraud');

  const showLibraryChrome = !isSearching && activeFilter === 'ALL';
  const showPdfs = !isSearching && (activeFilter === 'ALL' || activeFilter === 'PDFS');
  const showVideos = !isSearching && (activeFilter === 'ALL' || activeFilter === 'VIDEOS');
  const showJersey = !isSearching && (activeFilter === 'ALL' || activeFilter === 'JERSEY');
  const showCases = !isSearching && (activeFilter === 'ALL' || activeFilter === 'CASES');
  const showTools = !isSearching && (activeFilter === 'ALL' || activeFilter === 'TOOLS');
  const showTopics = showLibraryChrome;

  const quickFilterOptions = useMemo(
    () =>
      educationQuickFilters.map((key) => ({
        key,
        label: educationQuickFilterLabels[key]
      })),
    []
  );

  const featuredGuides = featured.filter(
    (entry): entry is Extract<EducationFeaturedItem, { kind: 'guide' }> => entry.kind === 'guide'
  );
  const featuredVideoItem = featured.find((entry) => entry.kind === 'video')?.item;
  const featuredCaseItem = featured.find((entry) => entry.kind === 'case')?.item;

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="education" />}
      scrollable={false}
    >
      <ContextScrollView
        ref={scrollRef}
        style={styles.contentScroll}
        contentContainerStyle={page.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <FigmaPageHeader
          title="EDUCATION"
          subtitle="LEARN THE HOBBY. SPOT THE FAKES."
          description="A research library of guides, videos, case studies, and tools for studying game-used cards and spotting red flags."
          heroSource={educationIcons.hero}
          guidanceKey="education"
          s={s}
          page={page}
        />

        <View
          style={[styles.stickyToolbar, toolbarStuck ? styles.stickyToolbarPinned : null]}
          onLayout={onToolbarLayout}
        >
          <View style={styles.searchRow}>
            <Ionicons name="search" size={s(20)} color={figmaColors.gray} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                if (text.trim()) setActiveFilter('ALL');
              }}
              placeholder="Search guides, videos, tools…"
              placeholderTextColor={figmaColors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Search education library"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={10}
                accessibilityLabel="Clear search"
              >
                <Ionicons name="close-circle" size={s(20)} color={figmaColors.gray} />
              </Pressable>
            ) : null}
          </View>
          <FigmaChipRow
            options={quickFilterOptions}
            value={activeFilter}
            onChange={onQuickFilter}
            s={s}
            t={t}
            style={styles.chipRow}
          />
        </View>

      {isSearching ? (
        <View>
          <SectionTitle title="SEARCH RESULTS" page={page} />
          {library.guides.length === 0 &&
          library.videos.length === 0 &&
          library.cases.length === 0 &&
          library.tools.length === 0 ? (
            <Text style={styles.emptyHint}>No matches in the library yet. Try another term.</Text>
          ) : null}

          {library.guides.length > 0 ? (
            <>
              <Text style={styles.subSectionLabel}>Guides & PDFs</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.guideRow}
              >
                {library.guides.map(({ key, ...guide }) => (
                  <EducationGuideCard
                    key={`q-g-${key}`}
                    {...guide}
                    s={s}
                    t={t}
                    onPress={() => openGuide({ key, ...guide })}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          {library.videos.map(({ key, ...video }) => (
            <EducationVideoCard
              key={`q-v-${key}`}
              {...video}
              s={s}
              t={t}
              onPress={() => openVideo({ key, ...video })}
            />
          ))}

          {library.cases.map(({ key, ...study }) => (
            <EducationCaseStudyCard
              key={`q-c-${key}`}
              {...study}
              s={s}
              t={t}
              onPressCta={() => openCaseCta(study.ctaTarget)}
            />
          ))}

          {library.tools.map(({ key, ...tool }) => (
            <EducationToolCard
              key={`q-t-${key}`}
              {...tool}
              s={s}
              t={t}
              onPress={() => void openExternal(tool.href)}
            />
          ))}
        </View>
      ) : null}

      {showLibraryChrome ? (
        <View onLayout={onSectionLayout('featured')}>
          <SectionTitle title="FEATURED PUBLICATIONS" page={page} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
          >
            {featuredGuides.map(({ item }) => {
              const { key, ...guide } = item;
              return (
                <EducationGuideCard
                  key={`feat-g-${key}`}
                  {...guide}
                  s={s}
                  t={t}
                  onPress={() => openGuide(item)}
                />
              );
            })}
          </ScrollView>
          {featuredVideoItem
            ? (() => {
                const { key, ...video } = featuredVideoItem;
                return (
                  <EducationVideoCard
                    key={`feat-v-${key}`}
                    {...video}
                    s={s}
                    t={t}
                    onPress={() => openVideo(featuredVideoItem)}
                  />
                );
              })()
            : null}
          {featuredCaseItem
            ? (() => {
                const { key, ...study } = featuredCaseItem;
                return (
                  <EducationCaseStudyCard
                    key={`feat-c-${key}`}
                    {...study}
                    s={s}
                    t={t}
                    onPressCta={() => openCaseCta(study.ctaTarget)}
                  />
                );
              })()
            : null}
        </View>
      ) : null}

      {showLibraryChrome ? (
        <View onLayout={onSectionLayout('browse')}>
          <SectionTitle title="BROWSE BY CONTENT TYPE" page={page} />
          <View style={styles.tileGrid}>
            {educationBrowseTypes.map((browse) => (
              <Pressable
                key={browse.key}
                onPress={() => onBrowseType(browse)}
                style={({ pressed }) => [styles.typeTile, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={browse.title}
              >
                <Text style={styles.typeTileTitle}>{browse.title}</Text>
                <Text style={styles.typeTileSubtitle}>{browse.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {showJersey ? (
        <View onLayout={onSectionLayout('jersey')}>
          <SectionTitle title="JERSEY ARCHIVE" page={page} />
          <Text style={styles.sectionHint}>
            Browse authorized jersey references by Sport → Team → Year. Inventory will appear here
            as licensed images are added.
          </Text>
          <View style={styles.sportRow}>
            {educationJerseySports.map((sport) => {
              const active = jerseySport === sport;
              return (
                <Pressable
                  key={sport}
                  onPress={() => setJerseySport(sport)}
                  style={[styles.sportChip, active ? styles.sportChipActive : null]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.sportChipText, active ? styles.sportChipTextActive : null]}>
                    {sport}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.jerseyEmpty}>
            <Text style={styles.jerseyEmptyTitle}>
              {jerseySport ? `${jerseySport.toUpperCase()} · TEAM → YEAR` : 'SELECT A SPORT'}
            </Text>
            <Text style={styles.emptyHint}>
              No jersey images catalogued yet for this path. The cascade is ready for archive
              content.
            </Text>
          </View>
        </View>
      ) : null}

      {showPdfs ? (
        <View onLayout={onSectionLayout('pdfs')}>
          <SectionTitle title="LATEST PDFS & GUIDES" page={page} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
          >
            {educationGuides.map(({ key, ...guide }) => (
              <EducationGuideCard
                key={`pdf-${key}`}
                {...guide}
                s={s}
                t={t}
                onPress={() => openGuide({ key, ...guide })}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {showVideos ? (
        <View onLayout={onSectionLayout('videos')}>
          <SectionTitle title="FEATURED VIDEOS" page={page} />
          {educationVideos.map(({ key, ...video }) => (
            <EducationVideoCard
              key={`vid-${key}`}
              {...video}
              s={s}
              t={t}
              onPress={() => openVideo({ key, ...video })}
            />
          ))}
        </View>
      ) : null}

      {showCases ? (
        <View onLayout={onSectionLayout('cases')}>
          <SectionTitle title="CASE STUDIES" page={page} />
          {educationCaseStudies.map(({ key, ...study }) => (
            <EducationCaseStudyCard
              key={key}
              {...study}
              s={s}
              t={t}
              onPressCta={() => openCaseCta(study.ctaTarget)}
            />
          ))}
        </View>
      ) : null}

      {showTopics ? (
        <View onLayout={onSectionLayout('topics')}>
          <SectionTitle title="BROWSE BY TOPIC" page={page} />
          <Text style={styles.sectionHint}>
            Secondary paths by difficulty and focus—same guides, organized for how you learn.
          </Text>

          <Text style={styles.subSectionLabel}>Beginner</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
          >
            {beginnerGuides.map(({ key, ...guide }) => (
              <EducationGuideCard
                key={`beg-${key}`}
                {...guide}
                compact
                s={s}
                t={t}
                onPress={() => openGuide({ key, ...guide })}
              />
            ))}
          </ScrollView>

          <Text style={styles.subSectionLabel}>Intermediate research</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
          >
            {intermediateGuides.map(({ key, ...guide }) => (
              <EducationGuideCard
                key={`int-${key}`}
                {...guide}
                compact
                s={s}
                t={t}
                onPress={() => openGuide({ key, ...guide })}
              />
            ))}
          </ScrollView>

          <Text style={styles.subSectionLabel}>Fraud & authentication</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guideRow}
          >
            {fraudGuides.map(({ key, ...guide }) => (
              <EducationGuideCard
                key={`fraud-${key}`}
                {...guide}
                compact
                s={s}
                t={t}
                onPress={() => openGuide({ key, ...guide })}
              />
            ))}
          </ScrollView>
          {fraudVideos.map(({ key, ...video }) => (
            <EducationVideoCard
              key={`fraud-v-${key}`}
              {...video}
              s={s}
              t={t}
              onPress={() => openVideo({ key, ...video })}
            />
          ))}
        </View>
      ) : null}

      {showTools ? (
        <View onLayout={onSectionLayout('tools')}>
          <SectionTitle title="COLLECTOR RESEARCH TOOLS" page={page} />
          <Text style={styles.sectionHint}>
            Action tools for verifying certifications and holograms—not articles.
          </Text>
          {educationTools.map(({ key, ...tool }) => (
            <EducationToolCard
              key={key}
              {...tool}
              s={s}
              t={t}
              onPress={() => void openExternal(tool.href)}
            />
          ))}
        </View>
      ) : null}

      {!isSearching ? (
        <>
          <Pressable
            onPress={() => router.push(authenticateHref())}
            style={({ pressed }) => [page.ctaCard, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Start authenticating"
          >
            <Image source={educationIcons.ctaShield} style={styles.ctaIcon} resizeMode="contain" />
            <View style={page.ctaTextWrap}>
              <Text style={page.ctaTitle}>KNOWLEDGE PROTECTS COLLECTORS.</Text>
              <Text style={page.ctaBody}>
                Learn the tells, verify the source, then apply what you know when you authenticate
                or contribute evidence.
              </Text>
            </View>
            <Image source={educationIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
          </Pressable>

          <Pressable
            onPress={() => router.push(mostWantedHref())}
            style={styles.secondaryCta}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryCtaText}>OPEN MOST WANTED</Text>
          </Pressable>
        </>
      ) : null}
      </ContextScrollView>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    contentScroll: {
      flex: 1
    },
    stickyToolbar: {
      backgroundColor: figmaColors.background,
      paddingTop: s(20),
      paddingBottom: s(12),
      // Bleed past page horizontal padding so sticky bar covers edge-to-edge while stuck.
      marginHorizontal: s(-20),
      paddingHorizontal: s(20),
      borderBottomWidth: 0,
      borderBottomColor: figmaColors.borderLight
    },
    stickyToolbarPinned: {
      // Match page scrollContent paddingTop / paddingHorizontal rhythm when docked.
      paddingTop: s(14),
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      borderWidth: 0.5,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(16),
      minHeight: s(44)
    },
    searchInput: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      paddingVertical: s(10)
    },
    chipRow: {
      marginTop: s(8),
      marginBottom: 0
    },
    guideRow: {
      gap: s(12),
      paddingBottom: s(8)
    },
    sectionHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.grayMuted,
      marginBottom: s(10)
    },
    subSectionLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.6,
      color: figmaColors.taupe,
      marginTop: s(4),
      marginBottom: s(8)
    },
    emptyHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.grayMuted,
      marginBottom: s(12)
    },
    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(10),
      marginBottom: s(8)
    },
    typeTile: {
      width: '47%',
      flexGrow: 1,
      minWidth: s(140),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(14),
      paddingHorizontal: s(12)
    },
    typeTileTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.4,
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    typeTileSubtitle: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted
    },
    sportRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginBottom: s(12)
    },
    sportChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingVertical: s(8),
      paddingHorizontal: s(14),
      backgroundColor: figmaColors.cream
    },
    sportChipActive: {
      borderColor: figmaColors.bronze,
      backgroundColor: figmaColors.surfaceHighlight
    },
    sportChipText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.gray
    },
    sportChipTextActive: {
      color: figmaColors.charcoal
    },
    jerseyEmpty: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      backgroundColor: figmaColors.surfaceMuted,
      padding: s(16),
      marginBottom: s(12)
    },
    jerseyEmptyTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    ctaIcon: {
      width: s(64),
      height: s(44)
    },
    ctaArrow: {
      width: s(32),
      height: s(21),
      marginRight: s(6)
    },
    pressed: { opacity: 0.92 },
    secondaryCta: {
      alignSelf: 'center',
      marginTop: s(4),
      marginBottom: s(16),
      paddingVertical: s(10),
      paddingHorizontal: s(16)
    },
    secondaryCtaText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.bronze
    }
  });
}
