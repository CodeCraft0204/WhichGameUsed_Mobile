import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { rankingRankStyle } from '@/constants/mostWantedStyles';
import { figmaColors } from '@/constants/figmaColors';
import type { BountyRankingRow } from '@/lib/most-wanted';

type Props = {
  row: BountyRankingRow;
  rank: number;
  s: (n: number) => number;
  t: (n: number) => number;
  onVote: (action: 'upvote' | 'downvote') => void;
};

function statusPresentation(status: string): { label: string; color: string } {
  const normalized = status.toLowerCase();
  if (normalized.includes('near')) return { label: 'Near Solved', color: figmaColors.success };
  if (normalized.includes('high') || normalized.includes('priority')) {
    return { label: 'High Priority', color: figmaColors.accentStrong };
  }
  return { label: status.replace(/_/g, ' '), color: figmaColors.grayMuted };
}

export function BountyRankingCard({ row, rank, s, t, onVote }: Props) {
  const rankStyle = rankingRankStyle(rank);
  const styles = useMemo(() => createStyles(s, t, rankStyle), [s, t, rankStyle]);
  const title = row.card_title?.trim() || row.player_name?.trim() || 'Card request';
  const status = statusPresentation(row.status);
  const meta = [row.product_year, row.product_name].filter(Boolean).join(' • ');

  return (
    <View style={styles.card}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
        <View style={styles.statsRow}>
          <Text style={styles.statHighlight}>{row.bounty_score} demand</Text>
          <Text style={styles.stat}>· {row.wishlist_count} saves</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.votes}>
        <Pressable
          onPress={() => onVote('upvote')}
          style={[styles.voteBtn, row.user_vote === 'upvote' && styles.voteBtnActive]}
        >
          <Ionicons
            name={row.user_vote === 'upvote' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={s(14)}
            color={row.user_vote === 'upvote' ? figmaColors.accentStrong : figmaColors.gray}
          />
        </Pressable>
        <Text style={styles.voteScore}>{row.vote_score}</Text>
        <Pressable
          onPress={() => onVote('downvote')}
          style={[styles.voteBtn, row.user_vote === 'downvote' && styles.voteBtnActive]}
        >
          <Ionicons
            name={row.user_vote === 'downvote' ? 'thumbs-down' : 'thumbs-down-outline'}
            size={s(14)}
            color={row.user_vote === 'downvote' ? figmaColors.error : figmaColors.gray}
          />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  rankStyle: { bg: string; border: string; label: string }
) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingVertical: s(10),
      paddingHorizontal: s(10),
      marginBottom: s(8)
    },
    rankBadge: {
      width: s(36),
      height: s(36),
      borderRadius: s(18),
      backgroundColor: rankStyle.bg,
      borderWidth: 1,
      borderColor: rankStyle.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    rankText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: rankStyle.label
    },
    body: { flex: 1, gap: s(3) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(3)
    },
    statHighlight: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(11),
      color: figmaColors.accentStrong
    },
    stat: {
      fontFamily: appFonts.body,
      fontSize: t(11),
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
    votes: {
      alignItems: 'center',
      gap: s(3),
      borderLeftWidth: 1,
      borderLeftColor: figmaColors.borderLight,
      paddingLeft: s(10)
    },
    voteBtn: {
      width: s(32),
      height: s(24),
      borderRadius: s(7),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.surface
    },
    voteBtnActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    },
    voteScore: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.brownMuted
    }
  });
}
