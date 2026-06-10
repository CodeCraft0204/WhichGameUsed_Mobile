import { databaseIcons } from '@/constants/databaseContent';
import { figmaIcons } from '@/constants/figmaIcons';

/** Most Wanted screen assets + ranking data (node 1:851). */
export const mostWantedIcons = {
  hero: require('@/assets/figma/mostwanted/hero_illustration.png'),
  gift: figmaIcons.treasureChest,
  like: figmaIcons.thumbsUp,
  dislike: figmaIcons.sealRejected,
  comment: figmaIcons.replyBubble,
  ctaTrophy: figmaIcons.trophyRanking,
  ctaArrow: require('@/assets/figma/mostwanted/cta_arrow.png')
} as const;

export type MostWantedVoteIcon = 'like' | 'dislike' | 'comment';

export const mostWantedVoteIconSources: Record<MostWantedVoteIcon, number> = {
  like: mostWantedIcons.like,
  dislike: mostWantedIcons.dislike,
  comment: mostWantedIcons.comment
};

/** Display sizes at 810 design width (from rank_01_row.png at 877px export). */
export const mostWantedIconSizes = {
  gift: { width: 23, height: 18 },
  vote: { width: 28, height: 17 }
} as const;

export type MostWantedRank = {
  key: string;
  rank: number;
  cardImage: number;
  title: string;
  subtitle: string;
  bounty?: string;
  likes: string;
  dislikes: string;
  comments: string;
  highlight?: boolean;
};

export const mostWantedSportTabs = ['ALL', 'BASEBALL', 'BASKETBALL', 'FOOTBALL', 'ALL-TIME'] as const;

export const mostWantedRanks: MostWantedRank[] = [
  {
    key: 'jordan',
    rank: 1,
    cardImage: databaseIcons.recordJordan,
    title: 'Michael Jordan',
    subtitle: 'Game-Used Patch Card',
    bounty: 'BOUNTY: SEALED WAX BOX + $250 GIFT CARD',
    likes: '428',
    dislikes: '18',
    comments: '96',
    highlight: true
  },
  {
    key: 'ruth',
    rank: 2,
    cardImage: databaseIcons.recordRuth,
    title: 'Babe Ruth',
    subtitle: 'Bat Relic Card',
    bounty: 'BOUNTY: VINTAGE GAME-USED CARD + $500',
    likes: '391',
    dislikes: '22',
    comments: '88'
  },
  {
    key: 'kobe',
    rank: 3,
    cardImage: databaseIcons.recentKobe,
    title: 'Kobe Bryant',
    subtitle: 'Game-Used Patch Auto Card',
    likes: '334',
    dislikes: '11',
    comments: '74'
  },
  {
    key: 'gehrig',
    rank: 4,
    cardImage: databaseIcons.recentGehrig,
    title: 'Lou Gehrig',
    subtitle: 'Jersey Relic Card',
    bounty: 'BOUNTY: HOBBY WAX PACKS + $100 GIFT CARD',
    likes: '372',
    dislikes: '15',
    comments: '71'
  },
  {
    key: 'mantle',
    rank: 5,
    cardImage: databaseIcons.recordMantle,
    title: 'Mickey Mantle',
    subtitle: 'Game-Used Memorabilia Card',
    bounty: 'BOUNTY: SEALED HOBBY BOX',
    likes: '336',
    dislikes: '12',
    comments: '63'
  }
];
