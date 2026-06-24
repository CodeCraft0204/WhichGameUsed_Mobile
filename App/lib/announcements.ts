import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type AppAnnouncement = {
  id: string;
  message: string;
  link_path: string | null;
};

const DISMISS_PREFIX = 'dismissed_announcement:';

export async function getActiveAnnouncement(): Promise<{
  announcement: AppAnnouncement | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('active_app_announcement');
  if (error) return { announcement: null, error: error.message };

  const row = (data as AppAnnouncement[] | null)?.[0] ?? null;
  if (!row) return { announcement: null, error: null };

  const dismissed = await AsyncStorage.getItem(`${DISMISS_PREFIX}${row.id}`);
  if (dismissed === '1') return { announcement: null, error: null };

  return { announcement: row, error: null };
}

export async function dismissAnnouncement(id: string): Promise<void> {
  await AsyncStorage.setItem(`${DISMISS_PREFIX}${id}`, '1');
}
