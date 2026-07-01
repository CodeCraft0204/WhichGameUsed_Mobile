/** "How points are earned" card — loads live rules when available. */
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { listLeaderboardPointRules } from '@/lib/leaderboard';

type ExplainerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
};

type RuleRow = { label: string; points: string };

export function LeaderboardPointsExplainer({ s, t }: ExplainerProps) {
  const styles = createStyles(s, t);
  const [rows, setRows] = useState<RuleRow[]>(
    leaderboardCopy.pointsEvents.map((item) => ({
      label: item.label,
      points: item.points
    }))
  );

  useEffect(() => {
    void (async () => {
      const { items } = await listLeaderboardPointRules();
      if (items.length < 1) return;
      const filtered = items.filter((r) => r.eventType !== 'admin_adjustment' && r.basePoints !== 0);
      if (filtered.length > 0) {
        setRows(
          filtered.map((r) => ({
            label: r.label,
            points: `${r.basePoints > 0 ? '+' : ''}${r.basePoints} pts`
          }))
        );
      }
    })();
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={figmaIcons.starImportant} style={styles.star} resizeMode="contain" />
        <View style={styles.headerText}>
          <Text style={styles.title}>{leaderboardCopy.sectionExplainer}</Text>
          <Text style={styles.hint}>{leaderboardCopy.explainerHint}</Text>
        </View>
        <Ionicons name="chevron-forward" size={s(18)} color={figmaColors.grayMuted} />
      </View>

      {rows.map((item, idx) => (
        <View
          key={`${item.label}-${idx}`}
          style={[styles.row, idx < rows.length - 1 && styles.rowDivider]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.pts}>{item.points}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      marginVertical: s(12),
      paddingHorizontal: s(16),
      paddingBottom: s(10)
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingTop: s(14),
      paddingBottom: s(10),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      marginBottom: s(4)
    },
    star: {
      width: s(28),
      height: s(28)
    },
    headerText: {
      flex: 1,
      gap: s(2)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(18),
      color: figmaColors.gray
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: s(9)
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(20),
      color: figmaColors.charcoal,
      flex: 1,
      paddingRight: s(8)
    },
    pts: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.textAccent,
      letterSpacing: 0.4
    }
  });
}
