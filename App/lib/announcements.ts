import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type AppAnnouncement = {
  id: string;
  message: string;
  subtitle: string | null;
  title: string | null;
  link_path: string | null;
};

const DISMISS_PREFIX = 'dismissed_announcement:';

async function isDismissedLocally(id: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${DISMISS_PREFIX}${id}`)) === '1';
}

async function isDismissedOnServer(announcementId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('app_announcement_dismissals')
    .select('id')
    .eq('announcement_id', announcementId)
    .eq('user_id', userId)
    .maybeSingle();

  return !!data;
}

export async function getActiveAnnouncement(): Promise<{
  announcement: AppAnnouncement | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('active_app_announcement');
  if (error) return { announcement: null, error: error.message };

  const row = (data as AppAnnouncement[] | null)?.[0] ?? null;
  if (!row) return { announcement: null, error: null };

  if (await isDismissedLocally(row.id)) {
    return { announcement: null, error: null };
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (userId && (await isDismissedOnServer(row.id, userId))) {
    return { announcement: null, error: null };
  }

  return { announcement: row, error: null };
}

export async function dismissAnnouncement(id: string): Promise<void> {
  await AsyncStorage.setItem(`${DISMISS_PREFIX}${id}`, '1');

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return;

  await supabase.from('app_announcement_dismissals').upsert(
    {
      announcement_id: id,
      user_id: userId,
      dismissed_at: new Date().toISOString()
    },
    { onConflict: 'announcement_id,user_id' }
  );
}
