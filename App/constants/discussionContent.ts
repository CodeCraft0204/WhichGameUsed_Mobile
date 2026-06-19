import { Platform, TextStyle } from 'react-native';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';

/** Discussion screen assets (node 1:431). */
export const discussionIcons = {
  hero: require('@/assets/figma/discussion/hero.png'),
  topicAuthenticated: figmaIcons.sealApproved,
  topicCounterfeits: figmaIcons.sealRejected,
  topicShowTell: figmaIcons.evidencePinned,
  topicAskAnything: figmaIcons.scrollQuestion,
  metaActivity: figmaIcons.metaCalendar,
  threadComment: figmaIcons.replyBubble,
  threadBookmark: figmaIcons.bookmark,
  threadLike: figmaIcons.thumbsUp,
  threadClap: figmaIcons.starImportant,
  threadReport: figmaIcons.watchEye,
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

export function discussionThreadsSectionTitle(tab: DiscussionTab, searching: boolean): string {
  if (searching) return 'SEARCH RESULTS';
  if (tab === 'HOTTEST') return 'TRENDING NOW';
  if (tab === 'ALL-TIME GREATS') return 'ALL-TIME GREATS';
  return 'LATEST THREADS';
}

export function discussionTabHint(tab: DiscussionTab): string {
  if (tab === 'HOTTEST') return 'Threads gaining momentum right now.';
  if (tab === 'ALL-TIME GREATS') return 'Most upvoted and discussed threads.';
  return 'Fresh posts from across the community.';
}

export function formatThreadCount(count: number): string {
  return `${count} thread${count === 1 ? '' : 's'}`;
}

export function formatCommentCount(count: number): string {
  return String(count);
}

export function formatVoteScore(count: number): string {
  if (!Number.isFinite(count) || count === 0) return '0';
  return count > 0 ? `+${count}` : String(count);
}

/** Platform font stack that renders color emoji (custom serif fonts do not). */
export function forumMessageFontFamily(): string | undefined {
  return Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: 'system-ui, -apple-system, "Segoe UI", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
    default: 'System'
  });
}

/** System / emoji-capable styles for posts, replies, and composer input. */
export function forumUserTextStyle(
  t: (n: number) => number,
  size = 16,
  lineHeight = 22
): TextStyle {
  return {
    fontFamily: forumMessageFontFamily(),
    fontSize: t(size),
    lineHeight: t(lineHeight + 4),
    color: figmaColors.charcoal
  };
}

export function forumEmojiTextStyle(
  t: (n: number) => number,
  size = 24
): TextStyle {
  return {
    fontFamily: forumMessageFontFamily(),
    fontSize: t(size),
    lineHeight: t(size + 8),
    color: figmaColors.charcoal,
    textAlign: 'center'
  };
}

/** True when a reply is only emoji (e.g. 👍 or ❤️). */
export function isForumEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/[a-zA-Z0-9]/.test(trimmed)) return false;
  return /\p{Extended_Pictographic}/u.test(trimmed);
}

export const forumQuickEmojis = ['👍', '❤️', '😂', '🔥', '🎉', '👀', '✅', '🙏'] as const;

export const defaultThreadAvatar = discussionIcons.avatar1;

/** Medium-style clap limits & timing — star/clap UI disabled; kept for future use. */
export const FORUM_MAX_CLAPS_PER_USER = 50;
export const FORUM_CLAP_DEBOUNCE_MS = 500;
export const FORUM_CLAP_HOLD_INTERVAL_MS = 100;

export function formatClapCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 10_000) return `${Math.round(count / 1000)}K`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export const forumReportReasons = [
  { key: 'spam', label: 'Spam or advertising' },
  { key: 'harassment', label: 'Harassment or abuse' },
  { key: 'misleading', label: 'Misleading or off-topic' },
  { key: 'other', label: 'Something else' }
] as const;

export type ForumReportReasonKey = (typeof forumReportReasons)[number]['key'];

export function forumReportReasonLabel(key: ForumReportReasonKey, notes?: string): string {
  const preset = forumReportReasons.find((row) => row.key === key);
  if (key === 'other' && notes?.trim()) return notes.trim();
  return preset?.label ?? 'Reported from mobile app';
}

/** @deprecated Clip sprites were replaced with direct icon assets. */
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
