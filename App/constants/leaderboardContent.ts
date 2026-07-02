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

/** THIS YEAR hidden until leaderboard_yearly DB view exists. */
export const leaderboardPeriodTabs = ['THIS MONTH', 'ALL-TIME'] as const;

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
