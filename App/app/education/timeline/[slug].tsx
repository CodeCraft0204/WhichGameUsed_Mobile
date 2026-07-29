import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EducationOriginalViewer } from '@/components/education/EducationOriginalViewer';
import { EducationTimelineEventCard } from '@/components/figma/EducationTimelineEventCard';
import { EducationTimelineSportFilters } from '@/components/figma/EducationTimelineSportFilters';
import { EducationTimelineYearNav } from '@/components/figma/EducationTimelineYearNav';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { educationIcons } from '@/constants/educationContent';
import {
  getEducationDocument,
  TIMELINE_ORIGINAL_DOCUMENT_ID
} from '@/constants/educationDocuments';
import { figmaColors } from '@/constants/figmaColors';
import {
  authenticateHref,
  discussionHref,
  educationHref,
  mostWantedHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  difficultyLabel,
  distinctYears,
  fetchTimelineBySlug,
  filterEventsBySport,
  HISTORY_TIMELINE_SLUG,
  rightsLabel,
  type EducationTimelineDetail,
  type EducationTimelineSportFilter
} from '@/lib/education-timeline';

export default function EducationTimelineScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [timeline, setTimeline] = useState<EducationTimelineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [sport, setSport] = useState<EducationTimelineSportFilter>('all');
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [originalOpen, setOriginalOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const yearRefs = useRef<Record<number, View | null>>({});

  const load = useCallback(async () => {
    const target = typeof slug === 'string' ? slug : HISTORY_TIMELINE_SLUG;
    setLoading(true);
    setError(null);
    const result = await fetchTimelineBySlug(target);
    setTimeline(result.timeline);
    setUsedFallback(result.usedFallback);
    setError(result.error);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredEvents = useMemo(
    () => (timeline ? filterEventsBySport(timeline.events, sport) : []),
    [timeline, sport]
  );
  const years = useMemo(() => distinctYears(filteredEvents), [filteredEvents]);

  useEffect(() => {
    setActiveYear(years[0] ?? null);
  }, [years]);

  const jumpToYear = useCallback((year: number) => {
    setActiveYear(year);
    const node = yearRefs.current[year];
    const scroll = scrollRef.current;
    if (!node || !scroll) return;
    node.measureLayout(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scroll as any,
      (_x, y) => {
        scroll.scrollTo({ y: Math.max(0, y - 8), animated: true });
      },
      () => undefined
    );
  }, []);

  const originalSource = educationIcons.timelineHistory;
  const remoteOriginal = timeline?.original_image_url
    ? { uri: timeline.original_image_url }
    : null;
  const imageSource = remoteOriginal ?? originalSource;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="HOBBY TIMELINE"
          subtitle="Loading…"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <View style={styles.center}>
          <ActivityIndicator color={figmaColors.umber} />
          <Text style={styles.hint}>Loading research timeline…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !timeline) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="HOBBY TIMELINE"
          subtitle="Unavailable"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Couldn’t load this timeline</Text>
          <Text style={styles.hint}>{error}</Text>
          <Pressable
            onPress={() => void load()}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          >
            <Text style={styles.primaryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!timeline) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ProfileSubpageHeader
          title="HOBBY TIMELINE"
          subtitle="Not found"
          s={s}
          t={t}
          onBack={() => router.replace(educationHref())}
        />
        <Text style={styles.error}>This timeline is not published or does not exist.</Text>
      </SafeAreaView>
    );
  }

  const updatedLabel = timeline.updated_at
    ? new Date(timeline.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ProfileSubpageHeader
            title="RESEARCH TIMELINE"
            subtitle={timeline.title}
            s={s}
            t={t}
            onBack={() => router.back()}
          />
          <Text style={styles.yearRange}>
            {timeline.start_year}–{timeline.end_year}
          </Text>
          <Text style={styles.summary}>{timeline.summary}</Text>
          <Text style={styles.meta}>
            Research Timeline · {difficultyLabel(timeline.difficulty)} · ~
            {timeline.estimated_read_minutes}-minute read
            {updatedLabel ? ` · Updated ${updatedLabel}` : ''}
          </Text>
          <View style={styles.metaChips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{rightsLabel(timeline.rights_status)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{timeline.publisher}</Text>
            </View>
            {usedFallback ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Offline seed</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => setOriginalOpen(true)}
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
              <Ionicons name="expand-outline" size={s(16)} color={figmaColors.cream} />
              <Text style={styles.secondaryBtnText}>View original</Text>
            </Pressable>
            {timeline.pdf_url ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/education/document/[id]',
                    params: {
                      id: 'remote-pdf',
                      uri: timeline.pdf_url!,
                      title: timeline.title
                    }
                  })
                }
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              >
                <Ionicons name="document-text-outline" size={s(16)} color={figmaColors.cream} />
                <Text style={styles.secondaryBtnText}>Open PDF</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.stickyFilters}>
          <EducationTimelineSportFilters value={sport} onChange={setSport} s={s} t={t} />
          <EducationTimelineYearNav
            years={years}
            activeYear={activeYear}
            onSelectYear={jumpToYear}
            s={s}
            t={t}
          />
        </View>

        <View style={styles.eventsBlock}>
          {filteredEvents.length === 0 ? (
            <Text style={styles.hint}>No milestones for this sport filter yet.</Text>
          ) : (
            years.map((year) => (
              <View
                key={year}
                ref={(node) => {
                  yearRefs.current[year] = node;
                }}
                collapsable={false}
              >
                <Text style={styles.yearHeading}>{year}</Text>
                {filteredEvents
                  .filter((event) => event.year_start === year)
                  .map((event) => (
                    <EducationTimelineEventCard
                      key={event.id}
                      event={event}
                      sources={timeline.sources}
                      s={s}
                      t={t}
                    />
                  ))}
              </View>
            ))
          )}
        </View>

        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>SOURCES AND FOOTNOTES</Text>
          {timeline.sources.length === 0 ? (
            <Text style={styles.hint}>No sources listed for this timeline.</Text>
          ) : (
            timeline.sources.map((source) => (
              <View key={source.id} style={styles.sourceCard}>
                <Text style={styles.sourceNum}>[{source.citation_number}]</Text>
                <View style={styles.sourceBody}>
                  <Text style={styles.sourceTitle}>{source.source_title}</Text>
                  {source.author ? <Text style={styles.sourceMeta}>{source.author}</Text> : null}
                  {source.published_on ? (
                    <Text style={styles.sourceMeta}>Date: {source.published_on}</Text>
                  ) : null}
                  {source.accessed_on ? (
                    <Text style={styles.sourceMeta}>Accessed: {source.accessed_on}</Text>
                  ) : null}
                  {source.rights_or_permission_note ? (
                    <Text style={styles.sourceMeta}>{source.rights_or_permission_note}</Text>
                  ) : null}
                  {source.source_url ? (
                    <Pressable onPress={() => void Linking.openURL(source.source_url!)}>
                      <Text style={styles.sourceLink}>Open URL</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.sectionTitle}>CONTINUE YOUR RESEARCH</Text>
          <Pressable
            onPress={() => router.push(authenticateHref())}
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}
          >
            <Text style={styles.ctaBtnText}>Authenticate a card</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(mostWantedHref())}
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}
          >
            <Text style={styles.ctaBtnText}>Browse Most Wanted</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(discussionHref())}
            style={({ pressed }) => [styles.ctaBtn, pressed && styles.pressed]}
          >
            <Text style={styles.ctaBtnText}>Join the discussion</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={originalOpen} animationType="slide" onRequestClose={() => setOriginalOpen(false)}>
        <EducationOriginalViewer
          document={
            getEducationDocument(TIMELINE_ORIGINAL_DOCUMENT_ID) ?? {
              id: TIMELINE_ORIGINAL_DOCUMENT_ID,
              title: 'Original timeline',
              kind: 'image',
              imageSource: educationIcons.timelineHistory
            }
          }
          imageOverride={imageSource}
          onClose={() => setOriginalOpen(false)}
          s={s}
          t={t}
        />
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(40) },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(10),
      paddingHorizontal: s(24)
    },
    yearRange: {
      fontFamily: appFonts.accent,
      fontSize: t(14),
      letterSpacing: 1,
      color: figmaColors.brown,
      marginBottom: s(8)
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      marginBottom: s(10)
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted,
      marginBottom: s(8)
    },
    metaChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginBottom: s(12)
    },
    chip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    chipText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      color: figmaColors.brown,
      letterSpacing: 0.4
    },
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginBottom: s(12)
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      backgroundColor: figmaColors.umber,
      borderRadius: s(8),
      paddingHorizontal: s(12),
      paddingVertical: s(10)
    },
    secondaryBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.cream,
      letterSpacing: 0.4
    },
    stickyFilters: {
      backgroundColor: figmaColors.background,
      paddingVertical: s(8),
      gap: s(8),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight
    },
    eventsBlock: {
      paddingTop: s(12)
    },
    yearHeading: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 1,
      color: figmaColors.brown,
      marginBottom: s(8),
      marginTop: s(4)
    },
    sourcesSection: {
      marginTop: s(16),
      gap: s(10)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.8,
      color: figmaColors.brown,
      marginBottom: s(4)
    },
    sourceCard: {
      flexDirection: 'row',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12)
    },
    sourceNum: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.umber
    },
    sourceBody: {
      flex: 1,
      gap: s(2)
    },
    sourceTitle: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.ink
    },
    sourceMeta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted
    },
    sourceLink: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.bronze,
      marginTop: s(4)
    },
    ctaSection: {
      marginTop: s(20),
      gap: s(8)
    },
    ctaBtn: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(12),
      paddingHorizontal: s(14)
    },
    ctaBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.umber
    },
    primaryBtn: {
      marginTop: s(8),
      backgroundColor: figmaColors.umber,
      borderRadius: s(8),
      paddingHorizontal: s(16),
      paddingVertical: s(10)
    },
    primaryBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.cream
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.brownMuted,
      textAlign: 'center'
    },
    error: {
      marginTop: s(24),
      paddingHorizontal: s(16),
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.error
    },
    errorTitle: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.ink,
      textAlign: 'center'
    },
    pressed: {
      opacity: 0.85
    }
  });
}
