import React from 'react';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';

type PeriodTabsProps<T extends string> = {
  tabs: readonly T[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

/** Leaderboard board tabs — same pill chips as Advocacy / Discussion / Most Wanted. */
export function LeaderboardPeriodTabs<T extends string>({
  tabs,
  value,
  onChange,
  s,
  t
}: PeriodTabsProps<T>) {
  return (
    <FigmaChipRow
      options={chipOptionsFromLabels(tabs)}
      value={value}
      onChange={onChange}
      s={s}
      t={t}
      style={{
        marginTop: s(18),
        marginBottom: s(14),
        width: '100%',
        alignSelf: 'stretch'
      }}
    />
  );
}
