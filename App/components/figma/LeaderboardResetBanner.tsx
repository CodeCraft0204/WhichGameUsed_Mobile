import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { daysUntilMonthEnd } from '@/lib/leaderboard';
import { leaderboardCopy } from '@/constants/leaderboardCopy';

type BannerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardResetBanner({ s, t }: BannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const daysLeft = daysUntilMonthEnd();

  if (dismissed || daysLeft <= 0) return null;

  return (
    <View style={styles.banner}>
      <Image source={figmaIcons.hourglassPending} style={styles.icon} resizeMode="contain" />
      <Text style={styles.text}>
        {leaderboardCopy.resetBanner(daysLeft)}
      </Text>
      <Pressable
        onPress={() => setDismissed(true)}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      >
        <Text style={styles.close}>×</Text>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.creamLight,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingVertical: s(12),
      paddingHorizontal: s(14),
      marginBottom: s(14)
    },
    icon: {
      width: s(28),
      height: s(28),
      flexShrink: 0
    },
    text: {
      flex: 1,
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
      paddingHorizontal: s(4)
    }
  });
}
