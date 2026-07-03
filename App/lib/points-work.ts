import { LEADERBOARD_EVENT_GROUPS } from '@/constants/leaderboardEventLabels';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import type { LeaderboardPointRule } from '@/lib/leaderboard';

export type PointsCategoryBlock = {
  key: string;
  label: string;
  rules: LeaderboardPointRule[];
};

const PENALTY_EVENT_TYPES = new Set(['content_removed', 'admin_adjustment']);

const DISPLAY_GROUP_KEYS = ['auth', 'research', 'forum'] as const;

export function formatPointDelta(points: number): string {
  const sign = points >= 0 ? '+' : '−';
  return `${sign}${Math.abs(points).toLocaleString('en-US')} pts`;
}

export function formatDailyCap(cap: number | null | undefined): string | null {
  if (cap == null || cap <= 0) return null;
  return `Up to ${cap}/day`;
}

export function shortRuleDescription(rule: LeaderboardPointRule): string {
  const mapped =
    pointsWorkCopy.ruleDescriptions[rule.eventType as keyof typeof pointsWorkCopy.ruleDescriptions];
  if (mapped) return mapped;
  if (rule.description?.trim()) {
    const trimmed = rule.description.trim();
    return trimmed.length > 140 ? `${trimmed.slice(0, 137)}…` : trimmed;
  }
  return rule.label;
}

export function groupPointRulesForDisplay(rules: LeaderboardPointRule[]): {
  categories: PointsCategoryBlock[];
  penalties: LeaderboardPointRule[];
} {
  const penalties = rules.filter((r) => PENALTY_EVENT_TYPES.has(r.eventType));
  const earnRules = rules.filter(
    (r) => !PENALTY_EVENT_TYPES.has(r.eventType) && r.basePoints !== 0
  );

  const categories: PointsCategoryBlock[] = [];

  for (const key of DISPLAY_GROUP_KEYS) {
    const group = LEADERBOARD_EVENT_GROUPS.find((g) => g.key === key);
    if (!group) continue;

    const groupRules = earnRules.filter((r) =>
      (group.types as readonly string[]).includes(r.eventType)
    );

    if (groupRules.length > 0) {
      categories.push({ key: group.key, label: group.label, rules: groupRules });
    }
  }

  return { categories, penalties };
}

export function summaryHintForCategory(
  key: 'auth' | 'research' | 'forum',
  rules: LeaderboardPointRule[]
): string {
  const group = LEADERBOARD_EVENT_GROUPS.find((g) => g.key === key);
  if (!group) return pointsWorkCopy.summary[key].hint;

  const groupRules = rules.filter((r) =>
    (group.types as readonly string[]).includes(r.eventType)
  );
  if (groupRules.length === 0) return pointsWorkCopy.summary[key].hint;

  const maxPositive = groupRules
    .filter((r) => r.basePoints > 0)
    .reduce((sum, r) => sum + r.basePoints, 0);

  if (maxPositive <= 0) return pointsWorkCopy.summary[key].hint;

  if (key === 'auth') {
    return `Up to ${formatPointDelta(maxPositive)} per verification flow`;
  }
  if (key === 'research') {
    const top = Math.max(...groupRules.map((r) => r.basePoints));
    return `${formatPointDelta(top)} per contribution`;
  }

  const capped = groupRules.some((r) => r.dailyCap != null && r.dailyCap > 0);
  return capped
    ? `${formatPointDelta(maxPositive)} combined — some actions capped daily`
    : `${formatPointDelta(maxPositive)} from community actions`;
}

/** Static fallback when API rules are unavailable. */
export function fallbackPointRules(): LeaderboardPointRule[] {
  return [
    {
      eventType: 'auth_evidence_accepted',
      label: 'Authentication accepted',
      basePoints: 50,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'auth_submission_verified',
      label: 'Submission verified',
      basePoints: 30,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'research_rating_received',
      label: 'Research contribution',
      basePoints: 25,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'guide_published',
      label: 'Guide published',
      basePoints: 20,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'thread_created',
      label: 'Forum thread created',
      basePoints: 5,
      dailyCap: 5,
      description: null
    },
    {
      eventType: 'comment_posted',
      label: 'Forum comment posted',
      basePoints: 2,
      dailyCap: 10,
      description: null
    },
    {
      eventType: 'upvote_received',
      label: 'Upvote received',
      basePoints: 2,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'downvote_received',
      label: 'Downvote received',
      basePoints: -1,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'content_removed',
      label: 'Content removed',
      basePoints: -20,
      dailyCap: null,
      description: null
    },
    {
      eventType: 'admin_adjustment',
      label: 'Admin adjustment',
      basePoints: 0,
      dailyCap: null,
      description: null
    }
  ];
}
