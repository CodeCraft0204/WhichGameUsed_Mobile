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
  { key: 'most_watched', label: 'Most watched' },
  { key: 'near_solved', label: 'Near Solved' }
] as const;

export type MostWantedSortKey = (typeof mostWantedSortOptions)[number]['key'];

export const mostWantedEvidenceTypes = [
  {
    key: 'card_front',
    label: 'Card Front',
    hint: 'Clear photo of the card face helps match player, set, and game-used markers.'
  },
  {
    key: 'card_back',
    label: 'Card Back',
    hint: 'Backs often show patch placement, numbers, and other authentication cues.'
  },
  {
    key: 'source_link',
    label: 'Source Link',
    hint: 'Auction, article, or social posts that document the jersey or card history.'
  },
  {
    key: 'jersey_reference',
    label: 'Jersey Reference',
    hint: 'Photos of the matching memorabilia help prove shared provenance.'
  },
  {
    key: 'screenshot',
    label: 'Screenshot',
    hint: 'Capture listings, comparisons, or research threads that support the case.'
  },
  {
    key: 'research_note',
    label: 'Research Note',
    hint: 'Context from your own research when an image or link is not enough alone.'
  }
] as const;

export type MostWantedEvidenceTypeKey = (typeof mostWantedEvidenceTypes)[number]['key'];

export const mostWantedBadgeCatalog = [
  { key: 'evidence_finder', label: 'Evidence Finder', icon: 'search' as const },
  { key: 'source_hunter', label: 'Source Hunter', icon: 'link' as const },
  { key: 'research_helper', label: 'Research Helper', icon: 'bulb' as const },
  { key: 'card_solver', label: 'Card Solver', icon: 'medal' as const },
  { key: 'most_wanted_contributor', label: 'Most Wanted Contributor', icon: 'ribbon' as const }
] as const;

export const mostWantedCopy = {
  pageTitle: 'MOST WANTED',
  pageSubtitle: 'Help the community find missing game-used evidence.',
  pageDescription:
    'Browse active Most Wanted cards, contribute research, and earn contributor badges plus leaderboard points when your evidence is approved.',
  statsActive: 'Active Cards',
  statsSolved: 'Solved This Month',
  statsContributors: 'Contributors',
  featuredLabel: 'FEATURED MOST WANTED',
  viewHunt: 'View Card',
  contribute: 'Contribute',
  neededPrefix: 'Needed:',
  watchersSuffix: 'collectors watching',
  badgeCreditChip: 'Badge credit',
  searchPlaceholder: 'Search player, team, year, set...',
  sortLabel: 'Sort',
  activeListTitle: 'ACTIVE MOST WANTED',
  shortcutsWatched: 'Watched',
  shortcutsContributions: 'Contributions',
  shortcutsSolved: 'Solved',
  shortcutsRankings: 'Priority',
  emptyTitle: 'No Most Wanted cards match your filters',
  emptyBody: 'Try another sport tab or clear your search.',
  errorTitle: 'Could not load Most Wanted',
  loading: 'Loading Most Wanted…',
  solvedTitle: 'SOLVED ITEMS',
  solvedSubtitle: 'Recently completed community research and contributor recognition.',
  contributionsTitle: 'MY CONTRIBUTIONS',
  contributionsSubtitle: 'Track evidence you submitted for review and badge credit.',
  submitTitle: 'SUBMIT EVIDENCE',
  submitSubtitle: 'A short guided flow to share evidence for review.',
  submitStepType: 'Evidence type',
  submitStepTypeHint: 'Choose what kind of proof you are sharing.',
  submitStepMedia: 'Image or source',
  submitStepMediaHint: 'Upload a photo or paste a link that supports your evidence.',
  submitStepNotes: 'Notes',
  submitStepNotesHint: 'Explain what this shows and why it helps close the case.',
  submitStepReview: 'Review & submit',
  submitStepReviewHint: 'Confirm everything looks right before sending for review.',
  submitCreditFooter: 'Submit useful evidence to earn contributor credit.',
  submitUploadEmpty: 'Tap to add a photo from your library or camera.',
  submitNext: 'Continue',
  submitBack: 'Back',
  submitConfirm: 'Submit for Review',
  detailTitle: 'MOST WANTED',
  detailWhatWeNeed: 'Evidence Still Needed',
  detailProgress: 'Evidence Progress',
  detailBadgePanel: 'Contributor Badge Available',
  detailBadgeCredit: 'Badge Credit Available',
  detailBadgeBody:
    'Earn recognition when your submitted evidence is approved. Approved contributions also earn leaderboard points — monthly cash prizes stay on the Leaderboard.',
  detailBadgesAvailable: 'Badges you can earn',
  detailYourBadges: 'Your badges on this card',
  detailContributors: 'Contributor recognition',
  detailLeads: 'What Has Been Submitted',
  detailSubmit: 'Submit Evidence',
  detailWishlist: 'Add to Wishlist',
  detailWatch: 'Watch Card',
  detailWatching: 'Watching',
  detailDiscuss: 'Discuss',
  detailShare: 'Share',
  detailViewCatalog: 'View Catalog Card',
  watchedTitle: 'WATCHED',
  watchedSubtitle: 'Most Wanted cards you are following for updates.',
  bountyRankingsTitle: 'COMMUNITY PRIORITY',
  bountyRankingsSubtitle: 'Vote on mystery cards collectors want researched next.',
  rankingsPageTitle: 'COMMUNITY PRIORITY',
  rankingsPageSubtitle: 'Ranked card requests by wishlist saves and community votes.',
  signInToContribute: 'Sign in to submit evidence for admin review.',
  emptyContributionsTitle: 'No contributions yet',
  emptyContributionsBody: 'Submit evidence on an active Most Wanted card to earn contributor credit.',
  emptyWatchedTitle: 'No watched cards',
  emptyWatchedBody: 'Watch Most Wanted cards from the main board to track progress and new leads here.',
  emptySolvedTitle: 'No solved items yet',
  emptySolvedBody: 'When the community completes a Most Wanted card, it will appear in this archive.',
  emptyRankingsTitle: 'No ranked requests yet',
  emptyRankingsBody: 'Card requests will appear here as collectors save and vote on them.',
  emptyBadges: 'No contributor badges awarded yet.',
  contributionSections: {
    pending_review: 'Pending',
    approved: 'Approved',
    needs_more_info: 'Needs More Info',
    rejected: 'Rejected'
  } as const
} as const;
