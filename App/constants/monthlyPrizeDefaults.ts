/** Standard monthly leaderboard cash prize — $50 to #1 every month. */
export const MONTHLY_CASH_PRIZE_AMOUNT_CENTS = 5000;

export const MONTHLY_CASH_PRIZE = {
  amountCents: MONTHLY_CASH_PRIZE_AMOUNT_CENTS,
  amountLabel: '$50',
  title: '$50 Cash',
  subtitle: '#1 monthly collector wins $50 cash.',
  description:
    'Every month, the top-ranked collector on the monthly leaderboard receives $50 cash. Rankings reset on the 1st — earn points through authentication work, research, and community discussion.'
} as const;

export function formatPrizeAmount(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString('en-US')}`;
}

export function currentMonthStartIso(d = new Date()): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function defaultMonthlyCashPrizeInput(month = currentMonthStartIso()) {
  return {
    month,
    title: MONTHLY_CASH_PRIZE.title,
    subtitle: MONTHLY_CASH_PRIZE.subtitle,
    description: MONTHLY_CASH_PRIZE.description,
    prize_amount_cents: MONTHLY_CASH_PRIZE.amountCents,
    hero_image_url: null as string | null,
    learn_more_path: '/leaderboard/prize',
    is_active: true,
    fulfillment_status: 'pending' as const,
    fulfillment_notes: ''
  };
}
