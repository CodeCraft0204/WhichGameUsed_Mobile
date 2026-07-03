import {
  MONTHLY_CASH_PRIZE,
  MONTHLY_CASH_PRIZE_AMOUNT_CENTS,
  currentMonthStartIso,
  formatPrizeAmount
} from '@/constants/monthlyPrizeDefaults';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import type { MonthlyPrize } from '@/lib/leaderboard';

export type PrizeCardDisplay = {
  sectionLabel: string;
  prizeName: string;
  summary: string;
  amountLabel: string;
};

export type PrizeDetailDisplay = PrizeCardDisplay & {
  description: string | null;
  heroImageUrl: string | null;
  monthLabel: string;
};

export function resolveMonthlyPrize(prize?: MonthlyPrize | null): MonthlyPrize {
  if (prize) return prize;
  return {
    id: 'default',
    month: currentMonthStartIso(),
    title: MONTHLY_CASH_PRIZE.title,
    subtitle: MONTHLY_CASH_PRIZE.subtitle,
    description: MONTHLY_CASH_PRIZE.description,
    prizeAmountCents: MONTHLY_CASH_PRIZE.amountCents,
    heroImageUrl: null,
    learnMorePath: '/leaderboard/prize',
    endsAt: null
  };
}

export function prizeAmountLabel(prize?: MonthlyPrize | null): string {
  const resolved = resolveMonthlyPrize(prize);
  return formatPrizeAmount(resolved.prizeAmountCents);
}

export function buildPrizeCardDisplay(prize?: MonthlyPrize | null): PrizeCardDisplay {
  const resolved = resolveMonthlyPrize(prize);
  const amountLabel = formatPrizeAmount(resolved.prizeAmountCents);

  return {
    sectionLabel: leaderboardCopy.prizeTitle,
    prizeName: amountLabel,
    summary: resolved.subtitle ?? MONTHLY_CASH_PRIZE.subtitle,
    amountLabel
  };
}

export function buildPrizeDetailDisplay(prize?: MonthlyPrize | null): PrizeDetailDisplay {
  const resolved = resolveMonthlyPrize(prize);
  const card = buildPrizeCardDisplay(resolved);

  return {
    ...card,
    description: resolved.description ?? MONTHLY_CASH_PRIZE.description,
    heroImageUrl: resolved.heroImageUrl,
    monthLabel: formatPrizeMonth(resolved.month)
  };
}

export function formatPrizeMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function resetBannerText(daysLeft: number, prize?: MonthlyPrize | null): string {
  const amount = prizeAmountLabel(prize);
  return leaderboardCopy.resetBannerWithPrize(daysLeft, amount);
}

export { MONTHLY_CASH_PRIZE_AMOUNT_CENTS };
