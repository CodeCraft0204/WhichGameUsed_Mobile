import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import { supabase } from '@/lib/supabase';

export type PresenceStatus = 'online' | 'away' | 'offline';

export type ProfilePresence = {
  userId: string;
  lastSeenAt: string | null;
  presenceStatus: PresenceStatus;
  effectiveStatus: PresenceStatus;
};

const ONLINE_MS = 2 * 60_000;
const AWAY_MS = 15 * 60_000;
const PREF_KEY = 'wgu.presence.manual_status';

const PREFERENCE_LISTENERS = new Set<(status: PresenceStatus) => void>();
let manualStatus: PresenceStatus = 'online';
let preferenceLoaded = false;

export const PRESENCE_OPTIONS: { value: PresenceStatus; label: string; hint: string }[] = [
  { value: 'online', label: 'Online', hint: 'Show as available' },
  { value: 'away', label: 'Away', hint: 'Show as away even while using the app' },
  { value: 'offline', label: 'Offline', hint: 'Appear offline to other collectors' }
];

export function resolvePresenceStatus(
  status: string | null | undefined,
  lastSeenAt: string | null | undefined,
  now = Date.now()
): PresenceStatus {
  if (!lastSeenAt) return 'offline';
  const seen = new Date(lastSeenAt).getTime();
  if (Number.isNaN(seen)) return 'offline';
  const age = now - seen;
  if (age > AWAY_MS) return 'offline';
  if ((status ?? 'offline') === 'offline') return 'offline';
  if ((status ?? 'offline') === 'away') return 'away';
  if ((status ?? 'offline') === 'online' && age <= ONLINE_MS) return 'online';
  if (age <= AWAY_MS) return 'away';
  return 'offline';
}

export function presenceLabel(status: PresenceStatus): string {
  if (status === 'online') return 'Online';
  if (status === 'away') return 'Away';
  return 'Offline';
}

export function presenceColor(status: PresenceStatus): string {
  if (status === 'online') return '#22c55e';
  if (status === 'away') return '#f59e0b';
  return '#94a3b8';
}

export function getManualPresence(): PresenceStatus {
  return manualStatus;
}

export function subscribeManualPresence(
  listener: (status: PresenceStatus) => void
): () => void {
  PREFERENCE_LISTENERS.add(listener);
  listener(manualStatus);
  return () => {
    PREFERENCE_LISTENERS.delete(listener);
  };
}

function emitManualPresence(status: PresenceStatus) {
  manualStatus = status;
  for (const listener of PREFERENCE_LISTENERS) listener(status);
}

async function persistManualPresence(status: PresenceStatus) {
  try {
    await AsyncStorage.setItem(PREF_KEY, status);
  } catch {
    // Ignore storage failures; in-memory preference still applies this session.
  }
}

export async function loadManualPresence(): Promise<PresenceStatus> {
  if (preferenceLoaded) return manualStatus;
  try {
    const raw = await AsyncStorage.getItem(PREF_KEY);
    if (raw === 'online' || raw === 'away' || raw === 'offline') {
      manualStatus = raw;
    }
  } catch {
    // Keep default.
  }
  preferenceLoaded = true;
  return manualStatus;
}

export async function touchMyPresence(status: PresenceStatus = 'online'): Promise<void> {
  const { error } = await supabase.rpc('touch_my_presence', { p_status: status });
  if (error) throw new Error(error.message);
}

/** Persist preference + publish immediately. Heartbeat will keep this status. */
export async function setMyPresenceStatus(
  status: PresenceStatus
): Promise<{ error: string | null }> {
  emitManualPresence(status);
  await persistManualPresence(status);
  try {
    await touchMyPresence(status);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Could not update status.' };
  }
}

export async function getProfilesPresence(
  userIds: string[]
): Promise<{ items: ProfilePresence[]; error: string | null }> {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) return { items: [], error: null };

  const { data, error } = await supabase.rpc('get_profiles_presence', {
    p_user_ids: ids
  });
  if (error) return { items: [], error: error.message };

  return {
    items: (data ?? []).map((row: Record<string, unknown>) => ({
      userId: row.user_id as string,
      lastSeenAt: (row.last_seen_at as string | null) ?? null,
      presenceStatus: (row.presence_status as PresenceStatus) ?? 'offline',
      effectiveStatus: resolvePresenceStatus(
        row.presence_status as string,
        row.last_seen_at as string | null
      )
    })),
    error: null
  };
}

/** Live updates when a peer's presence row changes. */
export function subscribeProfilePresence(
  userId: string,
  onChange: () => void
): () => void {
  const channel = supabase
    .channel(`profile-presence:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      () => onChange()
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

function statusForAppState(appState: AppStateStatus): PresenceStatus {
  const preferred = getManualPresence();
  if (preferred === 'offline') return 'offline';
  if (appState !== 'active') return preferred === 'online' ? 'away' : preferred;
  return preferred;
}

/** Keep presence fresh while the app is open; respects manual Online/Away/Offline. */
export function startPresenceHeartbeat(getSignedIn: () => boolean): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  let appState: AppStateStatus = AppState.currentState;
  let cancelled = false;

  const beat = (status: PresenceStatus) => {
    if (cancelled || !getSignedIn()) return;
    void touchMyPresence(status);
  };

  const sync = () => {
    beat(statusForAppState(appState));
  };

  const startTimer = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (appState === 'active') sync();
    }, 45_000);
  };

  void loadManualPresence().then(() => {
    if (cancelled) return;
    sync();
    if (appState === 'active') startTimer();
  });

  const unsubPref = subscribeManualPresence(() => {
    sync();
  });

  const sub = AppState.addEventListener('change', (next) => {
    appState = next;
    if (next === 'active') {
      sync();
      startTimer();
    } else if (next === 'background' || next === 'inactive') {
      sync();
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  });

  return () => {
    cancelled = true;
    unsubPref();
    sub.remove();
    if (timer) clearInterval(timer);
    if (getSignedIn() && getManualPresence() !== 'offline') {
      void touchMyPresence('offline');
    }
  };
}
