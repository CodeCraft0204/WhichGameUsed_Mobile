import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { subscribeUserNotifications } from '@/lib/notification-realtime';
import {
  countUnreadNotifications,
  type UserNotification
} from '@/lib/notifications';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  registerPushTokenWithBackend,
  setAppBadgeCount,
  unregisterPushTokenFromBackend
} from '@/lib/push-notifications';
import { listInboxConversations } from '@/lib/social';

type SocialNotificationsContextValue = {
  unreadInboxCount: number;
  unreadNotificationCount: number;
  totalUnreadCount: number;
  latestAlert: UserNotification | null;
  dismissLatestAlert: () => void;
  refreshCounts: () => Promise<void>;
};

const SocialNotificationsContext = createContext<SocialNotificationsContextValue | null>(null);

export function SocialNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState<UserNotification | null>(null);

  const refreshCounts = useCallback(async () => {
    if (!user) {
      setUnreadInboxCount(0);
      setUnreadNotificationCount(0);
      await setAppBadgeCount(0);
      return;
    }

    const [inboxRes, notifCount] = await Promise.all([
      listInboxConversations(),
      countUnreadNotifications()
    ]);

    const inboxUnread = inboxRes.items.reduce((sum, row) => sum + row.unreadCount, 0);
    setUnreadInboxCount(inboxUnread);
    setUnreadNotificationCount(notifCount);
    await setAppBadgeCount(inboxUnread + notifCount);
  }, [user]);

  const dismissLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  useEffect(() => {
    if (!user) {
      setLatestAlert(null);
      void refreshCounts();
      return;
    }

    void refreshCounts();
    void registerPushTokenWithBackend();

    const unsubscribeRealtime = subscribeUserNotifications(user.id, (notification) => {
      setLatestAlert(notification);
      void refreshCounts();
    });

    const unsubscribePushReceived = addNotificationReceivedListener(() => {
      void refreshCounts();
    });

    const unsubscribePushResponse = addNotificationResponseListener(() => {
      void refreshCounts();
    });

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') void refreshCounts();
    };
    const appStateSub = AppState.addEventListener('change', onAppState);

    return () => {
      unsubscribeRealtime();
      unsubscribePushReceived();
      unsubscribePushResponse();
      appStateSub.remove();
    };
  }, [refreshCounts, user]);

  useEffect(() => {
    if (user) return;
    void unregisterPushTokenFromBackend();
  }, [user]);

  const value = useMemo(
    () => ({
      unreadInboxCount,
      unreadNotificationCount,
      totalUnreadCount: unreadInboxCount + unreadNotificationCount,
      latestAlert,
      dismissLatestAlert,
      refreshCounts
    }),
    [
      dismissLatestAlert,
      latestAlert,
      refreshCounts,
      unreadInboxCount,
      unreadNotificationCount
    ]
  );

  return (
    <SocialNotificationsContext.Provider value={value}>{children}</SocialNotificationsContext.Provider>
  );
}

export function useSocialNotifications(): SocialNotificationsContextValue {
  const ctx = useContext(SocialNotificationsContext);
  if (!ctx) {
    throw new Error('useSocialNotifications must be used within SocialNotificationsProvider');
  }
  return ctx;
}
