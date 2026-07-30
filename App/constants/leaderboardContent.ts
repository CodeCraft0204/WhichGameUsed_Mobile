import { leaderboardAssets } from '@/constants/leaderboardAssets';

/** Leaderboard screen assets + ranking data. */
export const leaderboardIcons = {
  hero: leaderboardAssets.heroTrophy,
  ctaTrophy: leaderboardAssets.ctaTrophy,
  ctaArrow: leaderboardAssets.ctaArrow
} as const;

export type LeaderboardRank = {
  key: string;
  rank: number;
  name: string;
  role: string;
  points: string;
  avatar: number;
  highlight?: boolean;
};

/** THIS MONTH = prize points. Other tabs = reputation boards (do not inflate monthly XP). */
export const leaderboardPeriodTabs = [
  'THIS MONTH',
  'LIFETIME XP',
  'EVIDENCE',
  'MOST WANTED',
  'DONUTS'
] as const;

export type LeaderboardBoardTab = (typeof leaderboardPeriodTabs)[number];

export function leaderboardTabToBoard(
  tab: string
): 'month' | 'lifetime' | 'evidence' | 'most_wanted' | 'donuts' {
  switch (tab) {
    case 'LIFETIME XP':
      return 'lifetime';
    case 'EVIDENCE':
      return 'evidence';
    case 'MOST WANTED':
      return 'most_wanted';
    case 'DONUTS':
      return 'donuts';
    default:
      return 'month';
  }
}

export const leaderboardRanks: LeaderboardRank[] = [
  {
    key: 'patchproof',
    rank: 1,
    name: 'PatchProof',
    role: 'Patch specialist',
    points: '12,840',
    avatar: require('@/assets/figma/leaderboard/avatar_rank1.png'),
    highlight: true
  },
  {
    key: 'rutharchive',
    rank: 2,
    name: 'RuthArchive',
    role: 'Photo match researcher',
    points: '10,615',
    avatar: require('@/assets/figma/leaderboard/avatar_rank2.png')
  },
  {
    key: 'carddetective',
    rank: 3,
    name: 'CardDetective',
    role: 'Authentication investigator',
    points: '9,432',
    avatar: require('@/assets/figma/leaderboard/avatar_rank3.png')
  },
  {
    key: 'provenanceguy',
    rank: 4,
    name: 'ProvenanceGuy',
    role: 'Vintage source hunter',
    points: '8,275',
    avatar: require('@/assets/figma/leaderboard/avatar_rank4.png')
  },
  {
    key: 'waxscholar',
    rank: 5,
    name: 'WaxScholar',
    role: 'Hobby researcher',
    points: '7,189',
    avatar: require('@/assets/figma/leaderboard/avatar_rank5.png')
  }
];
