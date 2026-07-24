import { supabase } from '@/lib/supabase';

export type UserNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link_path: string | null;
  read_at: string | null;
  created_at: string;
};

const NOTIFICATION_COLUMNS = 'id, kind, title, body, link_path, read_at, created_at';

async function requireUserId(): Promise<{ userId: string | null; error: string | null }> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { userId: null, error: error.message };
  const userId = data.user?.id ?? null;
  if (!userId) return { userId: null, error: 'Not signed in.' };
  return { userId, error: null };
}

export async function listMyNotifications(
  limit = 30,
  offset = 0
): Promise<{
  items: UserNotification[];
  hasMore: boolean;
  error: string | null;
}> {
  const { userId, error: authError } = await requireUserId();
  if (!userId) return { items: [], hasMore: false, error: authError };

  const { data, error } = await supabase
    .from('user_notifications')
    .select(NOTIFICATION_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { items: [], hasMore: false, error: error.message };
  const items = (data ?? []) as UserNotification[];
  return { items, hasMore: items.length === limit, error: null };
}

export async function countUnreadNotifications(): Promise<number> {
  const { userId } = await requireUserId();
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('user_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<{ error: string | null }> {
  const { userId, error: authError } = await requireUserId();
  if (!userId) return { error: authError };

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .is('read_at', null);

  return { error: error?.message ?? null };
}

export async function markAllNotificationsRead(): Promise<{ error: string | null }> {
  const { userId, error: authError } = await requireUserId();
  if (!userId) return { error: authError };

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  return { error: error?.message ?? null };
}
