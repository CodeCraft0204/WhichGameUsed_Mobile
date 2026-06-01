import { databaseIcons } from '@/constants/databaseContent';

/** Discussion screen assets (node 1:431). */
export const discussionIcons = {
  hero: require('@/assets/figma/discussion/hero.png'),
  topicAuthenticated: require('@/assets/figma/discussion/topic_01.png'),
  topicCounterfeits: require('@/assets/figma/discussion/topic_02.png'),
  topicShowTell: require('@/assets/figma/discussion/topic_03.png'),
  topicAskAnything: require('@/assets/figma/discussion/topic_04.png'),
  threadActions: require('@/assets/figma/discussion/thread_01.png'),
  avatar1: require('@/assets/figma/leaderboard/avatar_rank1.png'),
  avatar2: require('@/assets/figma/leaderboard/avatar_rank2.png'),
  avatar3: require('@/assets/figma/leaderboard/avatar_rank3.png'),
  sectionChevron: require('@/assets/figma/discussion/chevron.png'),
  cardChevron: require('@/assets/figma/database/card_chevron.png'),
  ctaIcon: require('@/assets/figma/discussion/cta_icon.png'),
  ctaArrow: require('@/assets/figma/discussion/cta_arrow.png'),
  metaFollowers: databaseIcons.metaPerson
} as const;

export type DiscussionTopic = {
  key: string;
  icon: number;
  title: string;
  description: string;
  followers: string;
  threads: string;
};

export type DiscussionThread = {
  key: string;
  avatar: number;
  title: string;
  category: string;
  author: string;
  comments: string;
};

export const discussionTabs = ['NEWEST', 'ALL-TIME GREATS', 'HOTTEST'] as const;

export const discussionTopics: DiscussionTopic[] = [
  {
    key: 'authenticated',
    icon: discussionIcons.topicAuthenticated,
    title: 'NEWLY AUTHENTICATED',
    description: 'Freshly proven cards, new labels, and recent database additions.',
    followers: '2.1k followers',
    threads: '384 threads'
  },
  {
    key: 'counterfeits',
    icon: discussionIcons.topicCounterfeits,
    title: 'THREE DOLLAR BILLS (COUNTERFEITS)',
    description: 'Examples of fake patches, suspicious cards, and red flags.',
    followers: '1.8k followers',
    threads: '290 threads'
  },
  {
    key: 'show-tell',
    icon: discussionIcons.topicShowTell,
    title: 'SHOW AND TELL',
    description: 'Share favorite cards, discoveries, and new evidence finds.',
    followers: '3.4k followers',
    threads: '621 threads'
  },
  {
    key: 'ask-anything',
    icon: discussionIcons.topicAskAnything,
    title: 'ASK (ALMOST) ANYTHING',
    description: 'Questions about provenance, photo matching, and hobby research.',
    followers: '2.6k followers',
    threads: '512 threads'
  }
];

export const discussionThreads: DiscussionThread[] = [
  {
    key: 'finals-patch',
    avatar: discussionIcons.avatar1,
    title: 'Can this patch be matched to the 2013 Finals?',
    category: 'NEWLY AUTHENTICATED',
    author: 'CardCollector42',
    comments: '28'
  },
  {
    key: 'ruth-stitching',
    avatar: discussionIcons.avatar2,
    title: 'Odd stitching on this Ruth relic window',
    category: 'THREE DOLLAR BILLS (COUNTERFEITS)',
    author: 'Heritage Hawk',
    comments: '19'
  },
  {
    key: 'beckett-tracking',
    avatar: discussionIcons.avatar3,
    title: 'Best Beckett issue for tracking early 2000s releases?',
    category: 'THREE DOLLAR BILLS (COUNTERFEITS)',
    author: 'HeritageHawk',
    comments: '34'
  }
];

/** Clip regions for thread action icons extracted from thread_01.png. */
export const discussionClipLayout = {
  threadRowWidth: 770,
  threadRowHeight: 100,
  threadCommentLeft: 618,
  threadCommentTop: 41,
  threadCommentWidth: 20,
  threadCommentHeight: 18,
  threadBookmarkLeft: 724,
  threadBookmarkTop: 40,
  threadBookmarkWidth: 16,
  threadBookmarkHeight: 20
} as const;
