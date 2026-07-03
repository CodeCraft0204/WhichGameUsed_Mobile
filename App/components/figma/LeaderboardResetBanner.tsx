import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaIcons } from '@/constants/figmaIcons';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { daysUntilMonthEnd } from '@/lib/leaderboard';
import { resetBannerText } from '@/lib/prize-display';

/** Torn-paper strip asset is 410×35 — keep width-driven height as a floor. */
const BANNER_ASPECT = 410 / 35;

type BannerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
  prize?: import('@/lib/leaderboard').MonthlyPrize | null;
};

export function LeaderboardResetBanner({ s, t, prize }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [bannerWidth, setBannerWidth] = useState(0);
  const styles = useMemo(() => createStyles(s, t, bannerWidth), [s, t, bannerWidth]);
  const daysLeft = daysUntilMonthEnd();
  const bannerText = resetBannerText(daysLeft, prize);

  if (dismissed || daysLeft <= 0) return null;

  return (
    <View
      style={styles.outer}
      onLayout={(e) => {
        const next = Math.round(e.nativeEvent.layout.width);
        if (next > 0 && next !== bannerWidth) setBannerWidth(next);
      }}
    >
      <ImageBackground
        source={leaderboardAssets.tornPaperBanner}
        style={styles.banner}
        imageStyle={styles.bannerImage}
        resizeMode="stretch"
      >
        <Image source={figmaIcons.hourglassPending} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>{bannerText}</Text>
        <Pressable
          onPress={() => setDismissed(true)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Text style={styles.close}>×</Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, bannerWidth: number) {
  const tb = (n: number) => bodyText(t, n);
  const aspectHeight = bannerWidth > 0 ? bannerWidth / BANNER_ASPECT : 0;
  const bannerHeight = Math.max(s(58), aspectHeight, s(52));

  return StyleSheet.create({
    outer: {
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: s(14)
    },
    banner: {
      width: '100%',
      minHeight: bannerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      paddingVertical: s(10),
      paddingLeft: '9%',
      paddingRight: '7%',
      overflow: 'hidden'
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'stretch'
    },
    icon: {
      width: s(28),
      height: s(28),
      flexShrink: 0
    },
    text: {
      flex: 1,
      flexShrink: 1,
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    close: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(22),
      lineHeight: t(24),
      color: figmaColors.gray,
      paddingHorizontal: s(2),
      flexShrink: 0
    }
  });
}
