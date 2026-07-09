export const mostWantedFilterTabs = [
  'ALL',
  'BASEBALL',
  'BASKETBALL',
  'FOOTBALL',
  'HIGH VALUE',
  'NEAR SOLVED'
] as const;

export type MostWantedFilterTab = (typeof mostWantedFilterTabs)[number];

export const mostWantedSortOptions = [
  { key: 'most_wanted', label: 'Most Wanted' },
  { key: 'newest', label: 'Newest' },
  { key: 'highest_reward', label: 'Highest Reward' },
  { key: 'near_solved', label: 'Near Solved' }
] as const;

export type MostWantedSortKey = (typeof mostWantedSortOptions)[number]['key'];

export const mostWantedEvidenceTypes = [
  { key: 'card_front', label: 'Card Front' },
  { key: 'card_back', label: 'Card Back' },
  { key: 'source_link', label: 'Source Link' },
  { key: 'jersey_reference', label: 'Jersey Reference' },
  { key: 'screenshot', label: 'Screenshot' },
  { key: 'research_note', label: 'Research Note' }
] as const;

export type MostWantedEvidenceTypeKey = (typeof mostWantedEvidenceTypes)[number]['key'];

export const mostWantedCopy = {
  pageTitle: 'MOST WANTED',
  pageSubtitle: 'Help the community find missing game-used evidence.',
  pageDescription:
    'Track active hunts, contribute research, and earn rewards when your evidence helps prove a card.',
  statsActive: 'Active Hunts',
  statsSolved: 'Solved This Month',
  statsRewardPool: 'Reward Pool',
  featuredLabel: 'FEATURED HUNT',
  viewHunt: 'View Hunt',
  contribute: 'Contribute',
  neededPrefix: 'Needed:',
  watchersSuffix: 'collectors watching',
  searchPlaceholder: 'Search player, team, year, set...',
  sortLabel: 'Sort',
  emptyTitle: 'No hunts match your filters',
  emptyBody: 'Try another sport tab or clear your search.',
  errorTitle: 'Could not load hunts',
  loading: 'Loading hunts…',
  solvedTitle: 'SOLVED HUNTS',
  solvedSubtitle: 'Recently completed community research.',
  contributionsTitle: 'MY CONTRIBUTIONS',
  contributionsSubtitle: 'Track evidence you submitted for review.',
  submitTitle: 'SUBMIT EVIDENCE',
  submitSubtitle: 'Share research for admin review.',
  detailWhatWeNeed: 'What We Need',
  detailProgress: 'Evidence Progress',
  detailReward: 'Reward / Recognition',
  detailLeads: 'Community Leads',
  detailSubmit: 'Submit Evidence',
  detailWishlist: 'Add to Wishlist',
  detailWatch: 'Watch Hunt',
  detailWatching: 'Watching',
  detailDiscuss: 'Discuss This Hunt',
  detailShare: 'Share',
  detailClaimReward: 'Claim Reward',
  detailRewardClaimed: 'Reward Claimed',
  watchedTitle: 'WATCHED HUNTS',
  watchedSubtitle: 'Hunts you are following for updates.',
  bountyRankingsTitle: 'TOP REQUESTS',
  bountyRankingsSubtitle: 'Vote on mystery cards collectors want researched next.',
  signInToContribute: 'Sign in to submit evidence for admin review.',
  contributionSections: {
    pending_review: 'Pending Review',
    approved: 'Approved',
    needs_more_info: 'Needs More Info',
    rejected: 'Rejected'
  } as const
} as const;
