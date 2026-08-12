import { LEADERBOARD_EVENT_GROUPS } from '@/constants/leaderboardEventLabels';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
import type { PointBreakdownGroup, PointEvent } from '@/lib/leaderboard';
import type { ImageSourcePropType } from 'react-native';

export type RankTheme = {
  laurel: ImageSourcePropType | null;
  accent: string;
  accentMuted: string;
};

const RANK_ACCENTS: Record<1 | 2 | 3, RankTheme> = {
  1: { laurel: leaderboardAssets.laurelGold, accent: '#C9A84C', accentMuted: '#A88830' },
  2: { laurel: leaderboardAssets.laurelSilver, accent: '#B0B0B0', accentMuted: '#8A8A8A' },
  3: { laurel: leaderboardAssets.laurelBronze, accent: '#B87333', accentMuted: '#95602A' }
};

const DEFAULT_RANK_THEME: RankTheme = {
  laurel: null,
  accent: '#D4BC6A',
  accentMuted: '#B8A050'
};

export function rankTheme(rank: number): RankTheme {
  if (rank === 1 || rank === 2 || rank === 3) return RANK_ACCENTS[rank];
  return DEFAULT_RANK_THEME;
}

const COLLECTOR_ROLES = ['Researcher', 'Authenticator', 'Collector'] as const;

/** Stable visual role label when we don't store roles on profiles yet. */
export function inferCollectorRole(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash + userId.charCodeAt(i) * (i + 1)) % 997;
  return COLLECTOR_ROLES[hash % COLLECTOR_ROLES.length];
}

export function dominantRoleLabel(groups: PointBreakdownGroup[]): string {
  if (groups.length === 0) return 'Collector';
  const top = [...groups].sort((a, b) => b.points - a.points)[0];
  return top?.label.replace(/s$/, '') ?? 'Collector';
}

export function profileTagline(groups: PointBreakdownGroup[]): string {
  const ordered = [...groups].sort((a, b) => b.points - a.points).slice(0, 3);
  if (ordered.length === 0) return 'Researcher. Collector. Preserver.';
  const labels = ordered.map((g) => {
    if (g.key === 'auth') return 'Authenticator';
    if (g.key === 'research') return 'Researcher';
    if (g.key === 'forum') return 'Community voice';
    return 'Preserver';
  });
  while (labels.length < 3) labels.push('Preserver');
  return `${labels[0]}. ${labels[1]}. ${labels[2]}.`;
}

export type ProfileStats = {
  totalPoints: number;
  authCount: number;
  evidenceCount: number;
  discussionCount: number;
};

export function buildProfileStats(events: PointEvent[], totalPoints: number): ProfileStats {
  const authTypes = new Set<string>(LEADERBOARD_EVENT_GROUPS.find((g) => g.key === 'auth')?.types ?? []);
  const forumTypes = new Set<string>(LEADERBOARD_EVENT_GROUPS.find((g) => g.key === 'forum')?.types ?? []);

  let authCount = 0;
  let evidenceCount = 0;
  let discussionCount = 0;

  for (const ev of events) {
    if (authTypes.has(ev.eventType)) {
      authCount += 1;
      if (ev.eventType === 'auth_evidence_accepted') evidenceCount += 1;
    }
    if (forumTypes.has(ev.eventType)) discussionCount += 1;
  }

  return { totalPoints, authCount, evidenceCount, discussionCount };
}

export type ProfileBadge = {
  key: string;
  label: string;
  icon: 'research' | 'auth' | 'star';
};

export function buildProfileBadges(groups: PointBreakdownGroup[]): ProfileBadge[] {
  const badges: ProfileBadge[] = [];
  const auth = groups.find((g) => g.key === 'auth')?.points ?? 0;
  const research = groups.find((g) => g.key === 'research')?.points ?? 0;
  const forum = groups.find((g) => g.key === 'forum')?.points ?? 0;

  if (research >= auth && research > 0) badges.push({ key: 'research', label: 'Top Researcher', icon: 'research' });
  if (auth > 0) badges.push({ key: 'auth', label: 'Evidence Expert', icon: 'auth' });
  if (forum > 0) badges.push({ key: 'forum', label: 'Community Leader', icon: 'star' });

  if (badges.length === 0) badges.push({ key: 'collector', label: 'Active Collector', icon: 'star' });
  return badges.slice(0, 3);
}

export function formatTopPercent(rank: number, poolSize = 100): string {
  const pct = Math.max(1, Math.min(99, Math.round((rank / Math.max(poolSize, rank)) * 100)));
  if (rank <= 3) return 'TOP 1%';
  if (rank <= 10) return 'TOP 5%';
  if (rank <= 20) return 'TOP 10%';
  return `TOP ${pct}%`;
}

export function eventGroupKey(eventType: string): keyof typeof import('@/constants/leaderboardAssets').BREAKDOWN_ICONS {
  for (const g of LEADERBOARD_EVENT_GROUPS) {
    if ((g.types as readonly string[]).includes(eventType)) {
      return g.key as 'auth' | 'research' | 'forum' | 'other';
    }
  }
  return 'other';
}

export function eventCategoryLabel(eventType: string): string {
  const key = eventGroupKey(eventType);
  if (key === 'auth') return 'Card Authentication';
  if (key === 'research') return 'Research Contribution';
  if (key === 'forum') return 'Discussion';
  return 'Community Activity';
}
