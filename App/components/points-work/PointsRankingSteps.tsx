import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function PointsRankingSteps({ s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{pointsWorkCopy.rankingTitle}</Text>
      {pointsWorkCopy.rankingSteps.map((step, index) => (
        <View key={index} style={styles.step}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
      <Text style={styles.note}>{pointsWorkCopy.eligibilityNote}</Text>

      <Text style={[styles.title, styles.systemsTitle]}>{pointsWorkCopy.systemsTitle}</Text>
      {pointsWorkCopy.systemsSteps.map((step, index) => (
        <View key={`sys-${index}`} style={styles.step}>
          <View style={styles.bullet}>
            <Text style={styles.bulletText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    panel: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12)
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: s(12)
    },
    step: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      marginBottom: s(10)
    },
    bullet: {
      width: s(24),
      height: s(24),
      borderRadius: s(12),
      backgroundColor: figmaColors.tabActiveBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: s(1)
    },
    bulletText: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(12),
      color: '#C9A84C'
    },
    stepText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(21),
      color: figmaColors.charcoal
    },
    note: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.gray,
      marginTop: s(4),
      fontStyle: 'italic'
    },
    systemsTitle: {
      marginTop: s(16)
    }
  });
}
