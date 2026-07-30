/** Copy for lifetime XP / Donuts / evidence quality (separate from monthly leaderboard points). */
export const reputationCopy = {
  sectionTitle: 'DETECTIVE RANK',
  donutsTitle: 'DONUTS',
  donutsHint: 'Appreciation you can give to helpful comments and evidence.',
  xpProgress: (current: number, next: number | null) =>
    next == null
      ? `${current.toLocaleString()} XP · Max rank`
      : `${current.toLocaleString()} / ${next.toLocaleString()} XP`,
  nextRank: (label: string) => `Next: ${label}`,
  customSubtitlePending: 'Custom subtitle pending admin review',
  requestSubtitleTitle: 'CUSTOM SUBTITLE',
  requestSubtitlePlaceholder: 'e.g. Patch Pattern Sleuth',
  requestSubtitleCta: 'REQUEST REVIEW',
  requestSubtitleBusy: 'Submitting…',
  attributesTitle: 'FILE STATUS',
  evidenceFileTitle: 'EVIDENCE FILE',
  researchersTitle: 'RESEARCHERS',
  qualityTitle: 'EVIDENCE QUALITY',
  cardDonutsReceived: (n: number) =>
    n === 1 ? '1 Donut gifted on this file' : `${n.toLocaleString()} Donuts gifted on this file`,
  achievementsTitle: 'ACHIEVEMENTS',
  achievementsHint: 'Earn badges for evidence, research, Most Wanted, and community appreciation.',
  achievementLocked: 'LOCKED',
  giveDonut: 'GIVE DONUT',
  giveDonutBusy: 'Sending…',
  giveDonutDone: 'Donut sent',
  giveDonutNeedSignIn: 'Sign in to give a Donut',
  giveDonutEmpty: 'No Donuts left to give',
  monthlyVsLifetime:
    'Monthly leaderboard points reset each month. Detective XP and Donuts are separate lifetime systems.',
  emptyRank: 'Start contributing to earn your detective rank.',
  boardEmpty: 'No rankings on this board yet — keep contributing.',
  boardEmptyLifetime: 'No lifetime detective XP yet — approve evidence and research to climb.',
  boardEmptyEvidence: 'No evidence rankings yet — authenticated assets will appear here.',
  boardEmptyMw: 'No confirmed Most Wanted contributions ranked yet.',
  boardEmptyDonuts: 'No Donuts received yet — gift appreciation to helpful collectors.',
  boardMetricXp: 'XP',
  boardMetricDonuts: 'Donuts',
  boardMetricEvidence: 'Evidence',
  boardMetricMw: 'Badges',
  boardHintLifetime: 'Lifetime detective XP — separate from the monthly prize board.',
  boardHintEvidence: 'Ranked by approved authentication evidence volume.',
  boardHintMw: 'Ranked by confirmed Most Wanted contributor badges.',
  boardHintDonuts: 'Ranked by Donuts received (social appreciation).'
} as const;
