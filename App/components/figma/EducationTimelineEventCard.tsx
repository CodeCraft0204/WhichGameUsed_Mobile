import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import {
  formatYearRange,
  relatedActionsForEvent,
  significanceLabel,
  sourcesForEvent,
  sportLabel,
  type EducationTimelineEvent,
  type EducationTimelineSource
} from '@/lib/education-timeline';
import {
  databaseCardHref,
  discussionHref,
  mostWantedHref
} from '@/constants/navigation';
import { useRouter } from 'expo-router';

type Props = {
  event: EducationTimelineEvent;
  sources: EducationTimelineSource[];
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationTimelineEventCard({ event, sources, s, t }: Props) {
  const router = useRouter();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [expanded, setExpanded] = useState(false);
  const range = formatYearRange(event);
  const eventSources = sourcesForEvent(sources, event.id);
  const related = relatedActionsForEvent(event);
  const sig = significanceLabel(event.significance);
  const hasNote = Boolean(event.detailed_note?.trim()) || eventSources.length > 0;
  const hasRelated =
    related.cards.length > 0 || related.discussions.length > 0 || related.mostWanted.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.year}>{range.primary}</Text>
        <View style={styles.sportChip}>
          <Text style={styles.sportChipText}>{sportLabel(event.sport).toUpperCase()}</Text>
        </View>
      </View>

      {range.introduced ? (
        <Text style={styles.rangeHint}>
          {range.introduced}
          {range.continuedThrough ? ` · ${range.continuedThrough}` : ''}
        </Text>
      ) : range.ongoing ? (
        <Text style={styles.rangeHint}>Ongoing</Text>
      ) : null}

      {event.manufacturer ? <Text style={styles.manufacturer}>{event.manufacturer}</Text> : null}
      {event.product_name ? <Text style={styles.product}>{event.product_name}</Text> : null}
      <Text style={styles.title}>{event.event_title}</Text>
      {event.short_summary ? <Text style={styles.summary}>{event.short_summary}</Text> : null}

      <View style={styles.badgeRow}>
        {sig ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sig}</Text>
          </View>
        ) : null}
        {event.is_first_across_sports ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>First across sports</Text>
          </View>
        ) : null}
        {event.is_first_in_sport ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>First in sport</Text>
          </View>
        ) : null}
        {eventSources.map((source) => (
          <View key={source.id} style={styles.badge}>
            <Text style={styles.badgeText}>^{source.citation_number}</Text>
          </View>
        ))}
      </View>

      {hasNote ? (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          style={({ pressed }) => [styles.noteToggle, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <Text style={styles.noteToggleText}>
            {expanded ? 'Hide historical note' : 'Why this mattered'}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={s(16)}
            color={figmaColors.brown}
          />
        </Pressable>
      ) : null}

      {expanded ? (
        <View style={styles.noteBody}>
          {event.detailed_note ? <Text style={styles.noteText}>{event.detailed_note}</Text> : null}
          {eventSources.map((source) => (
            <View key={source.id} style={styles.sourceBlock}>
              <Text style={styles.sourceTitle}>
                [{source.citation_number}] {source.source_title}
              </Text>
              {source.author ? <Text style={styles.sourceMeta}>{source.author}</Text> : null}
              {source.published_on ? (
                <Text style={styles.sourceMeta}>Published {source.published_on}</Text>
              ) : null}
              {source.source_url ? (
                <Pressable onPress={() => void Linking.openURL(source.source_url!)}>
                  <Text style={styles.sourceLink}>Open source</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {hasRelated ? (
        <View style={styles.relatedRow}>
          {related.cards.slice(0, 3).map((id) => (
            <Pressable
              key={id}
              onPress={() => router.push(databaseCardHref(id))}
              style={styles.relatedBtn}
            >
              <Text style={styles.relatedBtnText}>View card</Text>
            </Pressable>
          ))}
          {related.discussions.slice(0, 1).map((id) => (
            <Pressable
              key={id}
              onPress={() => router.push(discussionHref())}
              style={styles.relatedBtn}
            >
              <Text style={styles.relatedBtnText}>Discussion</Text>
            </Pressable>
          ))}
          {related.mostWanted.slice(0, 1).map((id) => (
            <Pressable
              key={id}
              onPress={() => router.push(mostWantedHref())}
              style={styles.relatedBtn}
            >
              <Text style={styles.relatedBtnText}>Most Wanted</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12),
      gap: s(6)
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8)
    },
    year: {
      fontFamily: appFonts.accent,
      fontSize: t(18),
      color: figmaColors.umber,
      letterSpacing: 0.6
    },
    sportChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    sportChipText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      color: figmaColors.brown,
      letterSpacing: 0.6
    },
    rangeHint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted
    },
    manufacturer: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.brownMuted,
      marginTop: s(2)
    },
    product: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.ink,
      marginTop: s(2)
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: s(4)
    },
    badge: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.surfaceMuted,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    badgeText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      color: figmaColors.brown,
      letterSpacing: 0.3
    },
    noteToggle: {
      marginTop: s(6),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: figmaColors.borderLight,
      paddingTop: s(10)
    },
    noteToggleText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    noteBody: {
      gap: s(8),
      paddingTop: s(4)
    },
    noteText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(21),
      color: figmaColors.charcoal
    },
    sourceBlock: {
      gap: s(2),
      paddingTop: s(4)
    },
    sourceTitle: {
      fontFamily: appFonts.body,
      fontSize: t(13),
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
      marginTop: s(2)
    },
    relatedRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(8)
    },
    relatedBtn: {
      backgroundColor: figmaColors.umber,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(8)
    },
    relatedBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.cream,
      letterSpacing: 0.4
    },
    pressed: {
      opacity: 0.85
    }
  });
}
