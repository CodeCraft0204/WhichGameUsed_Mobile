import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

function pushPlatform(): 'ios' | 'android' | 'web' | 'unknown' {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'web') return 'web';
  return 'unknown';
}

export async function ensurePushPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (!Device.isDevice) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function registerPushTokenWithBackend(): Promise<{ error: string | null }> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return { error: null };
  }

  const granted = await ensurePushPermissions();
  if (!granted) {
    return { error: 'Notification permission was not granted.' };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    return { error: 'Expo project ID is missing from app config.' };
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenResult.data;

  const { error } = await supabase.rpc('register_user_push_token', {
    p_token: token,
    p_platform: pushPlatform()
  });

  return { error: error?.message ?? null };
}

export async function unregisterPushTokenFromBackend(): Promise<void> {
  if (Platform.OS === 'web' || !Device.isDevice) return;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) return;

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    await supabase.rpc('unregister_user_push_token', { p_token: tokenResult.data });
  } catch {
    // Best-effort on sign-out.
  }
}

export async function setAppBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // Unsupported on some platforms.
  }
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(handler);
  return () => sub.remove();
}

export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): () => void {
  const sub = Notifications.addNotificationReceivedListener(handler);
  return () => sub.remove();
}
