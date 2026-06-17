import { figmaIcons } from '@/constants/figmaIcons';

/** Discussion screen assets (node 1:431). */
export const discussionIcons = {
  hero: require('@/assets/figma/discussion/hero.png'),
  topicAuthenticated: figmaIcons.sealApproved,
  topicCounterfeits: figmaIcons.sealRejected,
  topicShowTell: figmaIcons.evidencePinned,
  topicAskAnything: figmaIcons.scrollQuestion,
  threadActions: figmaIcons.topicNotepad,
  avatar1: require('@/assets/figma/leaderboard/avatar_rank1.png'),
  avatar2: require('@/assets/figma/leaderboard/avatar_rank2.png'),
  avatar3: require('@/assets/figma/leaderboard/avatar_rank3.png'),
  sectionChevron: require('@/assets/figma/discussion/chevron.png'),
  cardChevron: require('@/assets/figma/database/card_chevron.png'),
  ctaIcon: require('@/assets/figma/discussion/cta_icon.png'),
  ctaArrow: require('@/assets/figma/discussion/cta_arrow.png'),
  metaFollowers: figmaIcons.metaSupporters
} as const;

export const discussionTabs = ['NEWEST', 'ALL-TIME GREATS', 'HOTTEST'] as const;

export type DiscussionTab = (typeof discussionTabs)[number];

export const topicIconBySlug: Record<string, number> = {
  'newly-authenticated': discussionIcons.topicAuthenticated,
  counterfeits: discussionIcons.topicCounterfeits,
  'show-and-tell': discussionIcons.topicShowTell,
  'ask-anything': discussionIcons.topicAskAnything
};

export function discussionSortFromTab(tab: DiscussionTab): 'newest' | 'hottest' | 'all_time' {
  if (tab === 'HOTTEST') return 'hottest';
  if (tab === 'ALL-TIME GREATS') return 'all_time';
  return 'newest';
}

export function formatThreadCount(count: number): string {
  return `${count} thread${count === 1 ? '' : 's'}`;
}

export function formatCommentCount(count: number): string {
  return String(count);
}

export const defaultThreadAvatar = discussionIcons.avatar1;

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
