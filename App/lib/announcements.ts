import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

export type AppAnnouncement = {
  id: string;
  message: string;
  subtitle: string | null;
  title: string | null;
  link_path: string | null;
};

export type AnnouncementDisplay = {
  title: string;
  content: string;
};

const DISMISS_PREFIX = 'dismissed_announcement:';

/** Split portal message into content + title when separate columns are missing. */
export function parseAnnouncementMessage(message: string): { subtitle: string; title: string } {
  const trimmed = message.trim();
  if (!trimmed) return { subtitle: '', title: '' };

  if (trimmed.includes('\n')) {
    const [subtitle, ...rest] = trimmed.split('\n');
    return { subtitle: subtitle.trim(), title: rest.join('\n').trim() };
  }

  if (trimmed.includes('|')) {
    const [subtitle, title] = trimmed.split('|');
    return { subtitle: subtitle.trim(), title: title.trim() };
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 4) {
    const titleWords = words.slice(-2);
    const subtitleWords = words.slice(0, -2);
    const titleCandidate = titleWords.join(' ');
    if (/^[A-Z]/.test(titleCandidate)) {
      return { subtitle: subtitleWords.join(' '), title: titleCandidate };
    }
  }

  return { subtitle: '', title: trimmed };
}

export function getAnnouncementDisplay(row: AppAnnouncement): AnnouncementDisplay {
  const parsed = parseAnnouncementMessage(row.message);
  return {
    title: row.title?.trim() || parsed.title,
    content: row.subtitle?.trim() || parsed.subtitle
  };
}

export function formatMarqueeTitles(announcements: AppAnnouncement[]): string {
  return announcements
    .map((row) => getAnnouncementDisplay(row).title)
    .filter(Boolean)
    .join('   ·   ');
}

/** @deprecated Prefer formatMarqueeTitles for minimized banner */
export function formatMarqueeText(announcements: AppAnnouncement[]): string {
  return formatMarqueeTitles(announcements);
}

async function isDismissedLocally(id: string): Promise<boolean> {
  return (await AsyncStorage.getItem(`${DISMISS_PREFIX}${id}`)) === '1';
}

async function getDismissedOnServerIds(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('app_announcement_dismissals')
    .select('announcement_id')
    .eq('user_id', userId);

  return new Set((data ?? []).map((row) => row.announcement_id as string));
}

async function filterDismissed(rows: AppAnnouncement[]): Promise<AppAnnouncement[]> {
  const visible: AppAnnouncement[] = [];

  for (const row of rows) {
    if (await isDismissedLocally(row.id)) continue;
    visible.push(row);
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return visible;

  const dismissedIds = await getDismissedOnServerIds(userId);
  return visible.filter((row) => !dismissedIds.has(row.id));
}

export async function listVisibleAnnouncements(): Promise<{
  announcements: AppAnnouncement[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('app_announcements')
    .select('id, message, subtitle, title, link_path')
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: false });

  if (error) return { announcements: [], error: error.message };

  const rows = (data ?? []) as AppAnnouncement[];
  const announcements = await filterDismissed(rows);
  return { announcements, error: null };
}

/** @deprecated Use listVisibleAnnouncements */
export async function getActiveAnnouncement(): Promise<{
  announcement: AppAnnouncement | null;
  error: string | null;
}> {
  const { announcements, error } = await listVisibleAnnouncements();
  return { announcement: announcements[0] ?? null, error };
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
