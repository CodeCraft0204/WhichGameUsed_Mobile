/** All UI strings for the Leaderboard screen. */
export const leaderboardCopy = {
  title: 'LEADERBOARD',
  subtitle: "THE HOBBY'S LEADING EXPERTS IN RABBIT HOLES.",
  description:
    'Track the top 20 users on the platform each month. Rankings are based on a points system that rewards strong authentication work, helpful participation, and research contributions.',

  sectionRanking: 'TOP 20 RANKING',
  sectionExplainer: 'HOW POINTS WORK',

  loading: 'Loading rankings…',
  empty: 'No rankings yet this period — be the first to earn points.',
  error: 'Couldn\'t load rankings.',
  retry: 'TRY AGAIN',

  selfUnranked: 'Earn your first points to join the leaderboard.',
  selfIneligible: 'Opt in to the leaderboard in Settings to appear here.',
  selfRankLabel: 'YOUR RANK',

  ctaTitle: 'LEARN, PARTICIPATE, EARN.',
  ctaBody: 'Each month, 1st place earns sealed product, classic game-used cards, and cash.',

  pointsEvents: [
    { label: 'Authentication accepted', points: '+50 pts' },
    { label: 'Research contribution', points: '+25 pts' },
    { label: 'Helpful forum post', points: '+10 pts' },
    { label: 'Upvote received', points: '+2 pts' }
  ] as const
} as const;
