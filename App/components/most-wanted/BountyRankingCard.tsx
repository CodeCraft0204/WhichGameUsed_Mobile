import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import type { BountyRankingRow } from '@/lib/most-wanted';

type Props = {
  row: BountyRankingRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onVote: (action: 'upvote' | 'downvote') => void;
};

export function BountyRankingCard({ row, s, t, onVote }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const title = row.card_title?.trim() || row.player_name?.trim() || 'Card request';

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.meta}>
          {[row.product_year, row.product_name].filter(Boolean).join(' · ')}
        </Text>
        <Text style={styles.score}>
          {row.bounty_score} pts · {row.wishlist_count} wishlists · {row.vote_score} votes
        </Text>
      </View>
      <View style={styles.votes}>
        <Pressable
          onPress={() => onVote('upvote')}
          style={[styles.voteBtn, row.user_vote === 'upvote' && styles.voteBtnActive]}
        >
          <Text style={styles.voteText}>▲</Text>
        </Pressable>
        <Pressable
          onPress={() => onVote('downvote')}
          style={[styles.voteBtn, row.user_vote === 'downvote' && styles.voteBtnActive]}
        >
          <Text style={styles.voteText}>▼</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(10),
      marginBottom: s(8)
    },
    body: { flex: 1, gap: s(4) },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    score: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray
    },
    votes: { gap: s(6) },
    voteBtn: {
      width: s(32),
      height: s(28),
      borderRadius: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.background
    },
    voteBtnActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    },
    voteText: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.charcoal
    }
  });
}
