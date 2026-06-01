import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  mostWantedIconSizes,
  mostWantedIcons,
  mostWantedVoteIconSources,
  type MostWantedRank,
  type MostWantedVoteIcon
} from '@/constants/mostWantedContent';
import { figmaColors } from '@/constants/figmaColors';

type MostWantedRankCardProps = MostWantedRank & {
  s: (n: number) => number;
  t: (n: number) => number;
};

function VoteIcon({
  icon,
  s
}: {
  icon: MostWantedVoteIcon;
  s: (n: number) => number;
}) {
  const { width, height } = mostWantedIconSizes.vote;

  return (
    <Image
      source={mostWantedVoteIconSources[icon]}
      style={{ width: s(width), height: s(height) }}
      resizeMode="contain"
    />
  );
}

function VoteColumn({
  icon,
  count,
  s,
  t,
  showDivider
}: {
  icon: MostWantedVoteIcon;
  count: string;
  s: (n: number) => number;
  t: (n: number) => number;
  showDivider?: boolean;
}) {
  return (
    <>
      {showDivider && <View style={{ width: 1, height: s(52), backgroundColor: '#ddd8d4' }} />}
      <View style={{ alignItems: 'center', justifyContent: 'center', gap: s(4), minWidth: s(44) }}>
        <VoteIcon icon={icon} s={s} />
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: t(13),
            lineHeight: t(15),
            color: figmaColors.gray
          }}
        >
          {count}
        </Text>
      </View>
    </>
  );
}

export function MostWantedRankCard({
  rank,
  cardImage,
  title,
  subtitle,
  bounty,
  likes,
  dislikes,
  comments,
  highlight,
  s,
  t
}: MostWantedRankCardProps) {
  const styles = createStyles(s, t, highlight);
  const giftSize = mostWantedIconSizes.gift;

  return (
    <View style={styles.card}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <Image source={cardImage} style={styles.cardImage} resizeMode="contain" />

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {bounty ? (
          <View style={styles.bountyPill}>
            <Image
              source={mostWantedIcons.gift}
              style={{ width: s(giftSize.width), height: s(giftSize.height) }}
              resizeMode="contain"
            />
            <Text style={styles.bountyText} numberOfLines={2}>
              {bounty}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.votesColumn}>
        <VoteColumn icon="like" count={likes} s={s} t={t} />
        <VoteColumn icon="dislike" count={dislikes} s={s} t={t} showDivider />
        <VoteColumn icon="comment" count={comments} s={s} t={t} showDivider />
      </View>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  highlight?: boolean
) {
  return StyleSheet.create({
    card: {
      backgroundColor: highlight ? '#f3f0ea' : figmaColors.cream,
      borderWidth: 1,
      borderColor: highlight ? figmaColors.accent : figmaColors.borderLight,
      borderRadius: s(highlight ? 12 : 10),
      minHeight: s(132),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingLeft: s(8),
      paddingRight: s(6)
    },
    rankBadge: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: '#eee8df',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    rankText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    cardImage: {
      width: s(88),
      height: s(96),
      marginHorizontal: s(8),
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(4),
      paddingRight: s(6)
    },
    title: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    bountyPill: {
      marginTop: s(4),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      backgroundColor: '#eee8df',
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      alignSelf: 'flex-start'
    },
    bountyText: {
      flex: 1,
      fontFamily: 'Inter_700Bold',
      fontSize: t(9),
      lineHeight: t(11),
      color: figmaColors.gray
    },
    votesColumn: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 0,
      paddingLeft: s(4)
    }
  });
}
