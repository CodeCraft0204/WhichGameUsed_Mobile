/** All UI strings for the Leaderboard screen. */
export const leaderboardCopy = {
  title: 'LEADERBOARD',
  subtitle: 'The Squad’s finest true hobby detectives.',
  description: '',

  sectionRanking: 'TOP 20 RANKING',
  topCollectorsTitle: 'TOP COLLECTORS',
  topCollectorsSubtitle: 'Leading contributors this period.',
  rankingListShort: (count: number) =>
    count < 10
      ? `${count} collector${count === 1 ? '' : 's'} ranked — open slots fill in as more people earn points.`
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
    `${days} day${days === 1 ? '' : 's'} left until this month's leaderboard prize.`,
  resetBannerWithPrize: (days: number, prizeName: string) =>
    `${days} day${days === 1 ? '' : 's'} left to win ${prizeName}`,

  ctaTitle: 'Hunt down the hobby’s Most Wanted.',
  ctaBody:
    'The fastest way to take home bounties and rewards is by contributing to a card’s evidence file. Follow Most Wanted to keep up with the memorabilia mysteries plaguing the platform.',

  howPointsTitle: 'HOW POINTS WORK',
  prizeTitle: "THIS MONTH'S PRIZE",
  prizeBody: '$100 in sealed wax, cards, and hobby paraphernalia for the #1 monthly collector.',
  prizeLearnMore: 'LEARN MORE',
  pointsColumn: 'Points',
  viewFullTop20: 'View Full Top 20',
  messagesLink: 'MESSAGES',
  messagesHint: 'Private chats with collectors you follow.',

  profile: {
    collectorProfile: 'COLLECTOR PROFILE',
    globalRank: 'GLOBAL RANK',
    totalPoints: 'TOTAL POINTS',
    cardsAuthenticated: 'CARDS AUTHENTICATED',
    evidenceUploads: 'EVIDENCE UPLOADS',
    discussions: 'DISCUSSIONS',
    events: 'Events',
    about: 'ABOUT',
    location: 'LOCATION',
    joined: 'Joined',
    pointsBreakdown: 'POINTS BREAKDOWN',
    recentActivity: 'RECENT ACTIVITY',
    mostWantedBadges: 'MOST WANTED BADGES',
    mostWantedBadgesHint: 'Admin-confirmed contributor recognition.',
    mostWantedBadgesSummary: (totalAwards: number, types: number) =>
      totalAwards === 1
        ? '1 confirmed contribution badge.'
        : `${totalAwards} confirmed contribution badges across ${types} type${types === 1 ? '' : 's'}.`,
    mostWantedBadgeTimes: (count: number) =>
      count === 1 ? '1 time earned' : `${count} times earned`,
    viewAll: 'View All',
    message: 'MESSAGE',
    follow: 'FOLLOW',
    unfollow: 'UNFOLLOW',
    following: 'FOLLOWING',
    followers: 'Followers',
    followingCount: 'Following',
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
