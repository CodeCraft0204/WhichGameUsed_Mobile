import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import { huntDisplayTitle, type MostWantedHuntRow } from '@/lib/most-wanted';

type WantedCardProps = {
  hunt: MostWantedHuntRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onPress: () => void;
  onContribute: () => void;
  /** Optional #n rank chip on the left (community priority list). */
  rank?: number;
  compact?: boolean;
};

function huntStatusPresentation(hunt: MostWantedHuntRow): { label: string; color: string } {
  if (hunt.status === 'solved') return { label: 'Solved', color: figmaColors.success };
  if (hunt.status === 'near_solved') return { label: 'Near Solved', color: figmaColors.success };
  if (hunt.priority_tag === 'high_value') {
    return { label: 'High Priority', color: figmaColors.accentStrong };
  }
  const needed = hunt.needed_labels.map((l) => l.toLowerCase());
  if (needed.some((l) => l.includes('front') || l.includes('back') || l.includes('image'))) {
    return { label: 'Need Image', color: figmaColors.grayMuted };
  }
  if (needed.some((l) => l.includes('source') || l.includes('auction'))) {
    return { label: 'Need Source', color: figmaColors.grayMuted };
  }
  return { label: 'Active', color: figmaColors.grayMuted };
}

export function WantedCard({ hunt, s, t, onPress, onContribute, rank, compact }: WantedCardProps) {
  const styles = useMemo(() => createStyles(s, t, compact), [s, t, compact]);
  const status = huntStatusPresentation(hunt);
  const total = Math.max(hunt.requirements_total, 1);
  const pct = Math.min(100, Math.round((hunt.requirements_fulfilled / total) * 100));
  const fillColor =
    hunt.status === 'near_solved' || hunt.status === 'solved' || pct >= 75
      ? figmaColors.success
      : hunt.priority_tag === 'high_value'
        ? figmaColors.accentStrong
        : figmaColors.progressFill;

  const meta = [hunt.team_name, hunt.product_year].filter(Boolean).join(' • ');

  const chips: string[] = [hunt.sport_slug.toUpperCase()];
  if (hunt.priority_tag === 'high_value') chips.push('HIGH VALUE');
  if (hunt.memorabilia_type) chips.push(hunt.memorabilia_type.toUpperCase());

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {typeof rank === 'number' ? (
        <View style={styles.rankChip}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      ) : null}

      <View style={styles.thumbWrap}>
        <HuntCardImage
          coverImageUrl={hunt.cover_image_url}
          imageUrl={hunt.imageUrl}
          style={styles.thumb}
          framed
          s={s}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {huntDisplayTitle(hunt)}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>
            {status.label}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
        </View>

        <View style={styles.chipRow}>
          {chips.slice(0, 3).map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rail}>
        <View style={styles.statRow}>
          <Image source={mostWantedIcons.eye} style={styles.statIcon} resizeMode="contain" />
          <Text style={styles.statValue}>{hunt.watcher_count}</Text>
        </View>
        {(hunt.comment_count ?? 0) > 0 ? (
          <View style={styles.statRow}>
            <Image source={mostWantedIcons.comment} style={styles.statIcon} resizeMode="contain" />
            <Text style={styles.statValue}>{hunt.comment_count}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={onContribute}
          hitSlop={s(6)}
          style={({ pressed }) => [styles.contributeBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel={`Contribute evidence for ${huntDisplayTitle(hunt)}`}
        >
          <Ionicons name="arrow-forward-circle-outline" size={s(20)} color={figmaColors.brown} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(10),
      paddingHorizontal: s(10),
      marginBottom: s(compact ? 8 : 10)
    },
    pressed: { opacity: 0.94 },
    rankChip: {
      width: s(34),
      height: s(34),
      borderRadius: s(17),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center'
    },
    rankText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.brown
    },
    thumbWrap: {
      width: s(compact ? 52 : 58)
    },
    thumb: {
      width: '100%',
      height: s(compact ? 52 : 58)
    },
    body: { flex: 1, gap: s(3) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(compact ? 14 : 15),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5),
      marginTop: s(1)
    },
    statusDot: {
      width: s(7),
      height: s(7),
      borderRadius: s(4)
    },
    statusText: {
      fontFamily: appFonts.body,
      fontSize: t(12)
    },
    track: {
      height: s(5),
      width: '58%',
      backgroundColor: figmaColors.progressTrack,
      borderRadius: s(3),
      overflow: 'hidden'
    },
    fill: {
      height: '100%',
      borderRadius: s(3)
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(5),
      marginTop: s(3)
    },
    chip: {
      backgroundColor: figmaColors.surfaceMuted,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(3),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    chipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    rail: {
      alignItems: 'flex-start',
      gap: s(6),
      borderLeftWidth: 1,
      borderLeftColor: figmaColors.borderLight,
      paddingLeft: s(10),
      alignSelf: 'stretch',
      justifyContent: 'center',
      minWidth: s(52)
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    statIcon: { width: s(14), height: s(12) },
    statValue: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    contributeBtn: {
      marginTop: s(2)
    }
  });
}
