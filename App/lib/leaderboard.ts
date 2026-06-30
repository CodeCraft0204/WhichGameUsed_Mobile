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

export function formatPoints(n: number): string {
  return n.toLocaleString('en-US');
}

// ─── Monthly ─────────────────────────────────────────────────────────────────

type MonthlyRow = {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  monthly_points: number;
  event_count: number;
  month: string;
};

export async function listLeaderboard(
  period: LeaderboardPeriod,
  limit = 20
): Promise<{ items: LeaderboardEntry[]; error: string | null }> {
  if (period === 'month') {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const { data, error } = await supabase
      .from('leaderboard_monthly')
      .select('user_id, username, display_name, avatar_url, monthly_points, event_count, month')
      .eq('month', monthStart)
      .order('monthly_points', { ascending: false })
      .limit(limit);

    if (error) return { items: [], error: error.message };
    const rows = (data ?? []) as MonthlyRow[];
    return {
      items: rows.map((row, i) => ({
        userId: row.user_id,
        rank: i + 1,
        displayName: displayName({ display_name: row.display_name, username: row.username }),
        username: row.username,
        avatarUrl: row.avatar_url,
        points: row.monthly_points,
        eventCount: row.event_count
      })),
      error: null
    };
  }

  // all_time
  type AllTimeRow = {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number;
    event_count: number;
  };

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) return { items: [], error: error.message };
  const rows = (data ?? []) as AllTimeRow[];
  return {
    items: rows.map((row, i) => ({
      userId: row.user_id,
      rank: i + 1,
      displayName: displayName({ display_name: row.display_name, username: row.username }),
      username: row.username,
      avatarUrl: row.avatar_url,
      points: row.total_points,
      eventCount: row.event_count
    })),
    error: null
  };
}

// ─── Signed-in user's own standing ───────────────────────────────────────────

export async function getMyStanding(
  userId: string,
  period: LeaderboardPeriod
): Promise<{ entry: LeaderboardEntry | null; rank: number | null; error: string | null }> {
  if (period === 'month') {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    // Fetch all rows for the month ordered by points to compute rank
    const { data, error } = await supabase
      .from('leaderboard_monthly')
      .select('user_id, username, display_name, avatar_url, monthly_points, event_count, month')
      .eq('month', monthStart)
      .order('monthly_points', { ascending: false });

    if (error) return { entry: null, rank: null, error: error.message };
    const rows = (data ?? []) as MonthlyRow[];
    const idx = rows.findIndex((r) => r.user_id === userId);
    if (idx === -1) return { entry: null, rank: null, error: null };
    const row = rows[idx];
    return {
      entry: {
        userId: row.user_id,
        rank: idx + 1,
        displayName: displayName({ display_name: row.display_name, username: row.username }),
        username: row.username,
        avatarUrl: row.avatar_url,
        points: row.monthly_points,
        eventCount: row.event_count
      },
      rank: idx + 1,
      error: null
    };
  }

  type AllTimeRow = {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    total_points: number;
    event_count: number;
  };

  const { data, error } = await supabase
    .from('leaderboard_all_time')
    .select('user_id, username, display_name, avatar_url, total_points, event_count')
    .order('total_points', { ascending: false });

  if (error) return { entry: null, rank: null, error: error.message };
  const rows = (data ?? []) as AllTimeRow[];
  const idx = rows.findIndex((r) => r.user_id === userId);
  if (idx === -1) return { entry: null, rank: null, error: null };
  const row = rows[idx];
  return {
    entry: {
      userId: row.user_id,
      rank: idx + 1,
      displayName: displayName({ display_name: row.display_name, username: row.username }),
      username: row.username,
      avatarUrl: row.avatar_url,
      points: row.total_points,
      eventCount: row.event_count
    },
    rank: idx + 1,
    error: null
  };
}

// ─── Public profile for tap-through ──────────────────────────────────────────

export type PublicProfile = {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  about: string | null;
  locationText: string | null;
};

export async function fetchPublicProfile(
  userId: string
): Promise<{ profile: PublicProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, about, location_text, is_public')
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
      locationText: data.location_text as string | null
    },
    error: null
  };
}
