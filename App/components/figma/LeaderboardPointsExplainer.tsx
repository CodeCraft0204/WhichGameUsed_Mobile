/** "How points work" card with category icons and gold progress bars. */
import React, { useEffect, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LEADERBOARD_EVENT_GROUPS } from '@/constants/leaderboardEventLabels';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { listLeaderboardPointRules } from '@/lib/leaderboard';

type ExplainerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
};

type CategoryRow = {
  key: string;
  label: string;
  icon: number;
  percent: number;
};

const FALLBACK: CategoryRow[] = [
  { key: 'auth', label: 'Authentication', icon: BREAKDOWN_ICONS.auth, percent: 40 },
  { key: 'research', label: 'Research', icon: BREAKDOWN_ICONS.research, percent: 35 },
  { key: 'forum', label: 'Discussion', icon: BREAKDOWN_ICONS.forum, percent: 15 },
  { key: 'other', label: 'Other', icon: BREAKDOWN_ICONS.other, percent: 10 }
];

export function LeaderboardPointsExplainer({ s, t }: ExplainerProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [rows, setRows] = useState<CategoryRow[]>(FALLBACK);

  useEffect(() => {
    void (async () => {
      const { items } = await listLeaderboardPointRules();
      if (items.length < 1) return;

      const weights = new Map<string, number>();
      for (const g of LEADERBOARD_EVENT_GROUPS) weights.set(g.key, 0);

      for (const rule of items) {
        if (rule.basePoints <= 0 || rule.eventType === 'admin_adjustment') continue;
        const group = LEADERBOARD_EVENT_GROUPS.find((g) =>
          (g.types as readonly string[]).includes(rule.eventType)
        );
        const key = group?.key ?? 'other';
        weights.set(key, (weights.get(key) ?? 0) + rule.basePoints);
      }

      const total = [...weights.values()].reduce((sum, v) => sum + v, 0) || 1;
      const next = LEADERBOARD_EVENT_GROUPS.map((g) => ({
        key: g.key,
        label: g.label,
        icon: BREAKDOWN_ICONS[g.key],
        percent: Math.round(((weights.get(g.key) ?? 0) / total) * 100)
      })).filter((r) => r.percent > 0);

      if (next.length > 0) setRows(next);
    })();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{leaderboardCopy.howPointsTitle}</Text>

      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <Image source={row.icon} style={styles.icon} resizeMode="contain" />
          <View style={styles.rowBody}>
            <View style={styles.rowLabel}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.pct}>{row.percent}%</Text>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(6, row.percent)}%` }]} />
            </View>
          </View>
        </View>
      ))}
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
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(14),
      color: figmaColors.charcoal,
      marginBottom: s(10),
      textTransform: 'uppercase',
      letterSpacing: 0.4
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(8)
    },
    icon: {
      width: s(26),
      height: s(26),
      flexShrink: 0
    },
    rowBody: {
      flex: 1,
      gap: s(4)
    },
    rowLabel: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.charcoal,
      flex: 1
    },
    pct: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(11),
      color: figmaColors.textAccent,
      marginLeft: s(4)
    },
    barTrack: {
      height: s(5),
      backgroundColor: figmaColors.stone,
      borderRadius: s(3),
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      backgroundColor: figmaColors.accentStrong,
      borderRadius: s(3)
    }
  });
}
