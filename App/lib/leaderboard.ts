import {
  MONTHLY_CASH_PRIZE,
  MONTHLY_CASH_PRIZE_AMOUNT_CENTS,
  currentMonthStartIso
} from '@/constants/monthlyPrizeDefaults';
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

export type MonthlyPrize = {
  id: string;
  month: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  prizeAmountCents: number;
  heroImageUrl: string | null;
  learnMorePath: string | null;
  endsAt: string | null;
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
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

type LeaderboardRankingRow = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  event_count: number;
  rank: number;
};

function mapRankingRow(row: LeaderboardRankingRow): LeaderboardEntry {
  return {
    userId: row.user_id,
    rank: Number(row.rank),
    displayName: displayName({ display_name: row.display_name, username: row.username }),
    username: row.username,
    avatarUrl: row.avatar_url,
    points: row.points,
    eventCount: row.event_count
  };
}

async function listLeaderboardFromViews(
  period: LeaderboardPeriod,
  limit: number
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
    return {
      items: (data ?? []).map((row, i) => ({
        userId: row.user_id as string,
        rank: i + 1,
        displayName: displayName({
          display_name: row.display_name as string | null,
          username: row.username as string | null
        }),
        username: row.username as string | null,
        avatarUrl: row.avatar_url as string | null,
        points: row.monthly_points as number,
        eventCount: row.event_count as number
      })),
      error: null
    };
  }

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };
  return {
    items: (data ?? []).map((row, i) => ({
      userId: row.user_id as string,
      rank: i + 1,
      displayName: displayName({
        display_name: row.display_name as string | null,
        username: row.username as string | null
      }),
      username: row.username as string | null,
      avatarUrl: row.avatar_url as string | null,
      points: row.total_points as number,
      eventCount: row.event_count as number
    })),
    error: null
  };
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export async function listLeaderboard(
  period: LeaderboardPeriod,
  limit = 20
): Promise<{ items: LeaderboardEntry[]; error: string | null }> {
  const monthStart = currentMonthStart();
  const { data, error } = await supabase.rpc('list_leaderboard_rankings', {
    p_period: period,
    p_limit: limit,
    p_month: period === 'month' ? monthStart : null
  });

  if (!error) {
    return {
      items: ((data ?? []) as LeaderboardRankingRow[]).map(mapRankingRow),
      error: null
    };
  }

  const missingRpc =
    error.message.includes('list_leaderboard_rankings') ||
    error.message.includes('schema cache') ||
    error.code === '42883';

  if (missingRpc) {
    return listLeaderboardFromViews(period, limit);
  }

  return { items: [], error: error.message };
}

export async function getUserStanding(
  userId: string,
  period: LeaderboardPeriod
): Promise<{ entry: LeaderboardEntry | null; error: string | null }> {
  const monthStart = currentMonthStart();
  const { data, error } = await supabase.rpc('get_leaderboard_user_standing', {
    p_user_id: userId,
    p_period: period,
    p_month: period === 'month' ? monthStart : null
  });

  if (!error) {
    const row = (Array.isArray(data) ? data[0] : data) as LeaderboardRankingRow | undefined;
    return { entry: row ? mapRankingRow(row) : null, error: null };
  }

  const missingRpc =
    error.message.includes('get_leaderboard_user_standing') ||
    error.message.includes('schema cache') ||
    error.code === '42883';

  if (missingRpc) {
    return getUserStandingFromViews(userId, period);
  }

  return { entry: null, error: error.message };
}

async function computeRankFromViews(
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

async function getUserStandingFromViews(
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

    const rank = await computeRankFromViews(userId, period, data.monthly_points as number);
    return {
      entry: {
        userId: data.user_id as string,
        rank,
        displayName: displayName({
          display_name: data.display_name as string | null,
          username: data.username as string | null
        }),
        username: data.username as string | null,
        avatarUrl: data.avatar_url as string | null,
        points: data.monthly_points as number,
        eventCount: data.event_count as number
      },
      error: null
    };
  }

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { entry: null, error: error.message };
  if (!data) return { entry: null, error: null };

  const rank = await computeRankFromViews(userId, period, data.total_points as number);
  return {
    entry: {
      userId: data.user_id as string,
      rank,
      displayName: displayName({
        display_name: data.display_name as string | null,
        username: data.username as string | null
      }),
      username: data.username as string | null,
      avatarUrl: data.avatar_url as string | null,
      points: data.total_points as number,
      eventCount: data.event_count as number
    },
    error: null
  };
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

// ─── Monthly prize ───────────────────────────────────────────────────────────

function mapMonthlyPrizeRow(row: Record<string, unknown>): MonthlyPrize {
  return {
    id: row.id as string,
    month: row.month as string,
    title: row.title as string,
    subtitle: (row.subtitle as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    prizeAmountCents: (row.prize_amount_cents as number | undefined) ?? MONTHLY_CASH_PRIZE_AMOUNT_CENTS,
    heroImageUrl: (row.hero_image_url as string | null) ?? null,
    learnMorePath: (row.learn_more_path as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null
  };
}

function defaultMonthlyPrize(): MonthlyPrize {
  return {
    id: 'default',
    month: currentMonthStartIso(),
    title: MONTHLY_CASH_PRIZE.title,
    subtitle: MONTHLY_CASH_PRIZE.subtitle,
    description: MONTHLY_CASH_PRIZE.description,
    prizeAmountCents: MONTHLY_CASH_PRIZE.amountCents,
    heroImageUrl: null,
    learnMorePath: '/leaderboard/prize',
    endsAt: null
  };
}

export async function fetchActiveMonthlyPrize(): Promise<{
  prize: MonthlyPrize | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('active_leaderboard_prize');

  if (error) {
    const monthStart = currentMonthStart();
    const { data: fallback, error: fallbackError } = await supabase
      .from('leaderboard_monthly_prizes')
      .select(
        'id, month, title, subtitle, description, prize_amount_cents, hero_image_url, learn_more_path, ends_at'
      )
      .eq('month', monthStart)
      .eq('is_active', true)
      .maybeSingle();

    if (fallbackError) return { prize: defaultMonthlyPrize(), error: fallbackError.message };
    return { prize: fallback ? mapMonthlyPrizeRow(fallback) : defaultMonthlyPrize(), error: null };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { prize: defaultMonthlyPrize(), error: null };
  return { prize: mapMonthlyPrizeRow(row as Record<string, unknown>), error: null };
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
  showForumActivityOnProfile: boolean;
};

export async function fetchPublicProfile(
  userId: string
): Promise<{ profile: PublicProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, display_name, username, avatar_url, about, location_text, is_public, created_at, show_forum_activity_on_profile'
    )
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
      joinedAt: data.created_at as string | null,
      showForumActivityOnProfile: Boolean(data.show_forum_activity_on_profile ?? true)
    },
    error: null
  };
}
