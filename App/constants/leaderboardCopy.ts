/** All UI strings for the Leaderboard screen. */
export const leaderboardCopy = {
  title: 'LEADERBOARD',
  subtitle: 'Top collectors. Serious research. Real evidence. Real community.',
  description:
    'Track the top 20 users each month. Rankings reward authentication work, helpful discussion, and research contributions.',

  sectionRanking: 'TOP 20 RANKING',
  rankingListShort: (count: number) =>
    count <= 3
      ? `Only ${count} collector${count === 1 ? '' : 's'} ranked so far — ranks 4–20 will appear here as more people earn points.`
      : null,
  sectionExplainer: 'HOW POINTS ARE EARNED',
  explainerHint: 'Upload evidence, join discussions, authenticate cards, and help the community.',

  loading: 'Loading rankings…',
  refreshing: 'Updating…',
  empty: 'No rankings yet this period — be the first to earn points.',
  error: 'Couldn\'t load rankings.',
  retry: 'TRY AGAIN',

  selfUnranked: 'Earn your first points to join the leaderboard.',
  selfIneligible: 'Opt in to the leaderboard in Settings to appear here.',
  selfRankLabel: 'YOUR RANK',
  viewProfile: 'View Profile',

  resetBanner: (days: number) =>
    `${days} day${days === 1 ? '' : 's'} left until this month's leaderboard resets. Keep contributing to climb higher.`,

  ctaTitle: 'LEARN, PARTICIPATE, EARN.',
  ctaBody: 'Each month, 1st place earns sealed product, classic game-used cards, and cash.',

  profile: {
    collectorProfile: 'COLLECTOR PROFILE',
    globalRank: 'GLOBAL RANK',
    totalPoints: 'TOTAL POINTS',
    events: 'Events',
    about: 'ABOUT',
    location: 'LOCATION',
    joined: 'Joined',
    pointsBreakdown: 'POINTS BREAKDOWN',
    recentActivity: 'RECENT ACTIVITY',
    noActivity: 'No point events yet for this period.',
    privateTitle: 'Private Profile',
    privateBody: 'This user has set their profile to private.'
  },

  pointsEvents: [
    { label: 'Authentication accepted', points: '+50 pts' },
    { label: 'Submission verified', points: '+30 pts' },
    { label: 'Research contribution', points: '+25 pts' },
    { label: 'Forum thread', points: '+5 pts' },
    { label: 'Forum comment', points: '+2 pts' },
    { label: 'Upvote received', points: '+2 pts' }
  ] as const
} as const;
