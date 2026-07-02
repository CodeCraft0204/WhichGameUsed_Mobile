import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type Props = {
  s: (n: number) => number;
  t: (n: number) => number;
  onLearnMore?: () => void;
};

export function LeaderboardPrizeCard({ s, t, onLearnMore }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={leaderboardAssets.giftIcon} style={styles.gift} resizeMode="contain" />
        <Text style={styles.title}>{leaderboardCopy.prizeTitle}</Text>
      </View>

      <Text style={styles.body}>{leaderboardCopy.prizeBody}</Text>

      <Pressable
        onPress={onLearnMore}
        disabled={!onLearnMore}
        accessibilityRole="button"
        style={styles.learnBtn}
      >
        <Image source={leaderboardAssets.learnMoreBtn} style={styles.learnArt} resizeMode="contain" />
      </Pressable>

      <Image source={leaderboardAssets.prizeDisplayCase} style={styles.prizeArt} resizeMode="contain" />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(12),
      minWidth: 0,
      alignItems: 'stretch'
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginBottom: s(8)
    },
    gift: {
      width: s(24),
      height: s(24)
    },
    title: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(13),
      color: figmaColors.charcoal,
      textTransform: 'uppercase',
      letterSpacing: 0.3
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      lineHeight: tb(17),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    learnBtn: {
      alignSelf: 'flex-start',
      marginBottom: s(8)
    },
    learnArt: {
      width: s(112),
      height: s(34)
    },
    prizeArt: {
      width: '100%',
      height: s(72),
      alignSelf: 'center'
    }
  });
}
