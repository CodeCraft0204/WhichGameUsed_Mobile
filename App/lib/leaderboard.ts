import { supabase } from '@/lib/supabase';
import { displayName } from '@/lib/profile';

export type LeaderboardPeriod = 'month' | 'all_time';

export type LeaderboardEntry = {
  userId: string;
  rank: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  eventCount: number;
};

export type LeaderboardPointRule = {
  eventType: string;
  label: string;
  basePoints: number;
  dailyCap: number | null;
  description: string | null;
};

export type PointEvent = {
  id: string;
  eventType: string;
  points: number;
  reason: string | null;
  createdAt: string;
};

export type PointBreakdownGroup = {
  key: string;
  label: string;
  points: number;
};

export function formatPoints(n: number): string {
  return n.toLocaleString('en-US');
}

function currentMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function mapMonthlyRow(row: {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  monthly_points: number;
  event_count: number;
}, rank: number): LeaderboardEntry {
  return {
    userId: row.user_id,
    rank,
    displayName: displayName({ display_name: row.display_name, username: row.username }),
    username: row.username,
    avatarUrl: row.avatar_url,
    points: row.monthly_points,
    eventCount: row.event_count
  };
}

function mapAllTimeRow(row: {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  total_points: number;
  event_count: number;
}, rank: number): LeaderboardEntry {
  return {
    userId: row.user_id,
    rank,
    displayName: displayName({ display_name: row.display_name, username: row.username }),
    username: row.username,
    avatarUrl: row.avatar_url,
    points: row.total_points,
    eventCount: row.event_count
  };
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export async function listLeaderboard(
  period: LeaderboardPeriod,
  limit = 20
): Promise<{ items: LeaderboardEntry[]; error: string | null }> {
  if (period === 'month') {
    const monthStart = currentMonthStart();

    const { data, error } = await supabase
      .from('leaderboard_monthly')
      .select('user_id, username, display_name, avatar_url, monthly_points, event_count, month')
      .eq('month', monthStart)
      .order('monthly_points', { ascending: false })
      .limit(limit);

    if (error) return { items: [], error: error.message };
    const rows = data ?? [];
    return {
      items: rows.map((row, i) => mapMonthlyRow(row, i + 1)),
      error: null
    };
  }

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };
  const rows = data ?? [];
  return {
    items: rows.map((row, i) => mapAllTimeRow(row, i + 1)),
    error: null
  };
}

async function computeRank(
  userId: string,
  period: LeaderboardPeriod,
  userPoints: number
): Promise<number> {
  if (period === 'month') {
    const monthStart = currentMonthStart();
    const { count, error } = await supabase
      .from('leaderboard_monthly')
      .select('*', { count: 'exact', head: true })
      .eq('month', monthStart)
      .gt('monthly_points', userPoints);

    if (error) return 0;
    return (count ?? 0) + 1;
  }

  const { count, error } = await supabase
    .from('leaderboard_all_time')
    .select('*', { count: 'exact', head: true })
    .gt('total_points', userPoints);

  if (error) return 0;
  return (count ?? 0) + 1;
}

export async function getUserStanding(
  userId: string,
  period: LeaderboardPeriod
): Promise<{ entry: LeaderboardEntry | null; error: string | null }> {
  if (period === 'month') {
    const monthStart = currentMonthStart();
    const { data, error } = await supabase
      .from('leaderboard_monthly')
      .select('user_id, username, display_name, avatar_url, monthly_points, event_count, month')
      .eq('month', monthStart)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return { entry: null, error: error.message };
    if (!data) return { entry: null, error: null };

    const rank = await computeRank(userId, period, data.monthly_points);
    return { entry: mapMonthlyRow(data, rank), error: null };
  }

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { entry: null, error: error.message };
  if (!data) return { entry: null, error: null };

  const rank = await computeRank(userId, period, data.total_points);
  return { entry: mapAllTimeRow(data, rank), error: null };
}

export async function getMyStanding(
  userId: string,
  period: LeaderboardPeriod
): Promise<{ entry: LeaderboardEntry | null; rank: number | null; error: string | null }> {
  const { entry, error } = await getUserStanding(userId, period);
  return { entry, rank: entry?.rank ?? null, error };
}

// ─── Point rules (for explainer) ─────────────────────────────────────────────

export async function listLeaderboardPointRules(): Promise<{
  items: LeaderboardPointRule[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('leaderboard_point_rules')
    .select('event_type, label, base_points, daily_cap, description')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row) => ({
      eventType: row.event_type as string,
      label: row.label as string,
      basePoints: row.base_points as number,
      dailyCap: (row.daily_cap as number | null) ?? null,
      description: row.description as string | null
    })),
    error: null
  };
}

// ─── Point history ───────────────────────────────────────────────────────────

export async function listUserPointEvents(
  userId: string,
  options?: { period?: LeaderboardPeriod; limit?: number }
): Promise<{ items: PointEvent[]; error: string | null }> {
  let query = supabase
    .from('leaderboard_events')
    .select('id, event_type, points, reason, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 40);

  if (options?.period === 'month') {
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    query = query.gte('created_at', monthStart);
  }

  const { data, error } = await query;
  if (error) return { items: [], error: error.message };

  return {
    items: (data ?? []).map((row) => ({
      id: row.id as string,
      eventType: row.event_type as string,
      points: row.points as number,
      reason: row.reason as string | null,
      createdAt: row.created_at as string
    })),
    error: null
  };
}

export function buildPointBreakdown(
  events: PointEvent[],
  groups: ReadonlyArray<{ key: string; label: string; types: readonly string[] }>
): PointBreakdownGroup[] {
  const totals = new Map<string, number>();
  for (const g of groups) totals.set(g.key, 0);

  const allTypes = new Set(groups.flatMap((g) => g.types));

  for (const ev of events) {
    const group = groups.find((g) => g.types.includes(ev.eventType));
    const key = group?.key ?? (allTypes.has(ev.eventType) ? 'other' : 'other');
    totals.set(key, (totals.get(key) ?? 0) + ev.points);
  }

  return groups
    .map((g) => ({ key: g.key, label: g.label, points: totals.get(g.key) ?? 0 }))
    .filter((g) => g.points !== 0);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysUntilMonthEnd(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(0, lastDay - now.getDate());
}

// ─── Realtime (shared channel — one subscription, many listeners) ────────────

type LeaderboardRealtimeListener = () => void;

let leaderboardRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
const leaderboardRealtimeListeners = new Set<LeaderboardRealtimeListener>();

function notifyLeaderboardListeners() {
  leaderboardRealtimeListeners.forEach((listener) => listener());
}

export function subscribeLeaderboardChanges(onChange: () => void): () => void {
  leaderboardRealtimeListeners.add(onChange);

  if (!leaderboardRealtimeChannel) {
    leaderboardRealtimeChannel = supabase
      .channel('leaderboard-events-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leaderboard_events' },
        () => notifyLeaderboardListeners()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard_events' },
        () => notifyLeaderboardListeners()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'leaderboard_events' },
        () => notifyLeaderboardListeners()
      )
      .subscribe();
  }

  return () => {
    leaderboardRealtimeListeners.delete(onChange);
    if (leaderboardRealtimeListeners.size === 0 && leaderboardRealtimeChannel) {
      void supabase.removeChannel(leaderboardRealtimeChannel);
      leaderboardRealtimeChannel = null;
    }
  };
}

// ─── Public profile ──────────────────────────────────────────────────────────

export type PublicProfile = {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  about: string | null;
  locationText: string | null;
  joinedAt: string | null;
};

export async function fetchPublicProfile(
  userId: string
): Promise<{ profile: PublicProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, about, location_text, is_public, created_at')
    .eq('id', userId)
    .eq('is_public', true)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  if (!data) return { profile: null, error: null };

  return {
    profile: {
      id: data.id as string,
      displayName: displayName({
        display_name: data.display_name as string | null,
        username: data.username as string | null
      }),
      username: data.username as string | null,
      avatarUrl: data.avatar_url as string | null,
      about: data.about as string | null,
      locationText: data.location_text as string | null,
      joinedAt: data.created_at as string | null
    },
    error: null
  };
}
