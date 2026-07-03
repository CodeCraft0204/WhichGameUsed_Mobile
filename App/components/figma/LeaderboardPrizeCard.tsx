import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <Text style={styles.title}>{leaderboardCopy.prizeTitle}</Text>
      <Text style={styles.body}>{leaderboardCopy.prizeBody}</Text>

      {onLearnMore ? (
        <Pressable
          onPress={onLearnMore}
          accessibilityRole="button"
          style={({ pressed }) => [styles.learnRow, pressed && styles.learnPressed]}
        >
          <Text style={styles.learnText}>{leaderboardCopy.prizeLearnMore}</Text>
          <Ionicons name="chevron-forward" size={s(14)} color={figmaColors.navActive} />
        </Pressable>
      ) : null}
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
      justifyContent: 'center'
    },
    title: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(13),
      lineHeight: t(15),
      color: figmaColors.charcoal,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(19),
      color: figmaColors.charcoal,
      marginTop: 0,
      marginBottom: s(10)
    },
    learnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
      alignSelf: 'flex-start'
    },
    learnPressed: {
      opacity: 0.85
    },
    learnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    }
  });
}
