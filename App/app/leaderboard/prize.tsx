/**
 * This month's leaderboard prize — detail screen.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { monthlyPrizeCopy } from '@/constants/monthlyPrizeCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { daysUntilMonthEnd, fetchActiveMonthlyPrize, type MonthlyPrize } from '@/lib/leaderboard';
import { buildPrizeDetailDisplay, prizeAmountLabel } from '@/lib/prize-display';

export default function MonthlyPrizeScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [prize, setPrize] = useState<MonthlyPrize | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { prize: row } = await fetchActiveMonthlyPrize();
    setPrize(row);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const display = useMemo(() => buildPrizeDetailDisplay(prize), [prize]);
  const daysLeft = daysUntilMonthEnd();

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={monthlyPrizeCopy.title}
        subtitle={display.monthLabel}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={figmaColors.charcoal} />
        </View>
      ) : (
        <>
          <View style={styles.amountPanel}>
            <Text style={styles.amountLabel}>{monthlyPrizeCopy.cashLabel}</Text>
            <Text style={styles.amountValue}>{prizeAmountLabel(prize)}</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.prizeName}>{display.summary}</Text>
            {display.description ? (
              <Text style={styles.description}>{display.description}</Text>
            ) : (
              <Text style={styles.description}>{monthlyPrizeCopy.noPrize}</Text>
            )}
            <Text style={styles.payoutNote}>{monthlyPrizeCopy.payoutNote}</Text>
          </View>

          <View style={styles.countdownPanel}>
            <Text style={styles.countdownLabel}>{monthlyPrizeCopy.countdownLabel}</Text>
            <Text style={styles.countdownValue}>
              {daysLeft} day{daysLeft === 1 ? '' : 's'} remaining
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{monthlyPrizeCopy.howToWinTitle}</Text>
            <Text style={styles.body}>{monthlyPrizeCopy.howToWinBody}</Text>
            <Text style={styles.note}>{monthlyPrizeCopy.eligibility}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{monthlyPrizeCopy.viewLeaderboard}</Text>
          </Pressable>
        </>
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    centred: {
      alignItems: 'center',
      paddingVertical: s(40)
    },
    amountPanel: {
      backgroundColor: figmaColors.tabActiveBg,
      borderRadius: s(14),
      padding: s(18),
      marginBottom: s(12),
      alignItems: 'center'
    },
    amountLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: '#C9A84C',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(4)
    },
    amountValue: {
      fontFamily: appFonts.display,
      fontSize: t(44),
      lineHeight: t(48),
      color: figmaColors.charcoal
    },
    panel: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12)
    },
    prizeName: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      lineHeight: tb(23),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    payoutNote: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(20),
      color: figmaColors.gray,
      fontStyle: 'italic'
    },
    countdownPanel: {
      backgroundColor: figmaColors.tabActiveBg,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12),
      alignItems: 'center'
    },
    countdownLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: '#C9A84C',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(4)
    },
    countdownValue: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: s(8)
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    note: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(20),
      color: figmaColors.gray,
      fontStyle: 'italic'
    },
    cta: {
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      paddingVertical: s(14),
      alignItems: 'center',
      marginBottom: s(12)
    },
    ctaPressed: {
      opacity: 0.88
    },
    ctaText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.charcoal,
      letterSpacing: 0.6
    }
  });
}
