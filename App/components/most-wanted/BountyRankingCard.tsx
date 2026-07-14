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

export function BountyRankingCard({ row, rank, s, t, onVote }: Props) {
  const rankStyle = rankingRankStyle(rank);
  const styles = useMemo(() => createStyles(s, t, rankStyle), [s, t, rankStyle]);
  const title = row.card_title?.trim() || row.player_name?.trim() || 'Card request';

  return (
    <View style={styles.card}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.meta}>
          {[row.product_year, row.product_name].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statHighlight}>{row.bounty_score} pts</Text>
          <Text style={styles.stat}>· {row.wishlist_count} wishlists</Text>
          <Text style={styles.stat}>· {row.vote_score} votes</Text>
          {(row.comment_count ?? 0) > 0 ? (
            <Text style={styles.stat}>· {row.comment_count} comments</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.votes}>
        <Pressable
          onPress={() => onVote('upvote')}
          style={[styles.voteBtn, row.user_vote === 'upvote' && styles.voteBtnActive]}
        >
          <Ionicons
            name="chevron-up"
            size={s(16)}
            color={row.user_vote === 'upvote' ? figmaColors.accentStrong : figmaColors.gray}
          />
        </Pressable>
        <Pressable
          onPress={() => onVote('downvote')}
          style={[styles.voteBtn, row.user_vote === 'downvote' && styles.voteBtnActive]}
        >
          <Ionicons
            name="chevron-down"
            size={s(16)}
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
      gap: s(10),
      backgroundColor: rankStyle.bg,
      borderWidth: 1,
      borderColor: rankStyle.border,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(10)
    },
    rankBadge: {
      width: s(36),
      height: s(36),
      borderRadius: s(18),
      backgroundColor: figmaColors.surface,
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
    body: { flex: 1, gap: s(4) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(2),
      marginTop: s(2)
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
    votes: { gap: s(6) },
    voteBtn: {
      width: s(34),
      height: s(30),
      borderRadius: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.surface
    },
    voteBtnActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    }
  });
}
