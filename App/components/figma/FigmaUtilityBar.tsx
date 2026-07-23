import { usePathname, useRouter } from 'expo-router';
import React, { useContext, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaSharedIcons } from '@/constants/figmaShared';
import {
  databaseSearchHref,
  messagesInboxHref,
  socialNotificationsHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { UtilitySearchContext } from '@/context/UtilitySearchContext';
import { appFonts } from '@/constants/appFonts';

type FigmaUtilityBarProps = {
  s: (n: number) => number;
  showMessages?: boolean;
  showNotifications?: boolean;
  messagesUnreadCount?: number;
  notificationsUnreadCount?: number;
  onPressMessages?: () => void;
  onPressNotifications?: () => void;
  onPressSearch?: () => void;
};

function formatBadgeCount(count: number): string {
  if (count > 99) return '99+';
  return String(count);
}

function fallbackSearchForPath(pathname: string): ReturnType<typeof databaseSearchHref> | string {
  if (pathname.includes('/messages')) return messagesInboxHref();
  if (pathname.includes('/discussion')) return '/discussion/discussion';
  if (pathname.includes('/mostwanted')) return '/mostwanted/mostwanted';
  if (pathname.includes('/education')) return '/education/education';
  if (pathname.includes('/authenticate')) return databaseSearchHref();
  if (pathname.includes('/leaderboard')) return databaseSearchHref();
  if (pathname.includes('/advocacy')) return databaseSearchHref();
  return databaseSearchHref();
}

export function FigmaUtilityBar({
  s,
  showMessages,
  showNotifications,
  messagesUnreadCount,
  notificationsUnreadCount,
  onPressMessages,
  onPressNotifications,
  onPressSearch
}: FigmaUtilityBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadInboxCount, unreadNotificationCount } = useSocialNotifications();
  const utilitySearch = useContext(UtilitySearchContext);

  const signedIn = Boolean(user);
  const showMsg = signedIn && (showMessages ?? true);
  const showNotif = signedIn && (showNotifications ?? true);
  const msgCount = messagesUnreadCount ?? unreadInboxCount;
  const notifCount = notificationsUnreadCount ?? unreadNotificationCount;

  const itemCount = 3 + (showMsg ? 1 : 0) + (showNotif ? 1 : 0);
  const styles = useMemo(() => createStyles(s, itemCount), [itemCount, s]);
  const messageIcon = msgCount > 0 ? figmaIcons.msgIconBadge : figmaIcons.msgIcon;

  const openMessages = () => {
    if (onPressMessages) {
      onPressMessages();
      return;
    }
    router.push(messagesInboxHref());
  };

  const openNotifications = () => {
    if (onPressNotifications) {
      onPressNotifications();
      return;
    }
    router.push(socialNotificationsHref());
  };

  const openSearch = () => {
    if (onPressSearch) {
      onPressSearch();
      return;
    }
    if (utilitySearch?.triggerSearch()) return;
    const target = fallbackSearchForPath(pathname);
    router.push(target as never);
  };

  return (
    <View style={styles.utilityBar}>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Search"
        onPress={openSearch}
      >
        <Image source={figmaSharedIcons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>

      {showMsg ? (
        <Pressable
          style={styles.utilityBtn}
          accessibilityRole="button"
          accessibilityLabel={msgCount > 0 ? `Messages, ${msgCount} unread` : 'Messages'}
          onPress={openMessages}
        >
          <Image source={messageIcon} style={styles.utilityIcon} resizeMode="contain" />
        </Pressable>
      ) : null}

      {showNotif ? (
        <Pressable
          style={styles.utilityBtn}
          accessibilityRole="button"
          accessibilityLabel={
            notifCount > 0 ? `Notifications, ${notifCount} unread` : 'Notifications'
          }
          onPress={openNotifications}
        >
          <View>
            <Image
              source={figmaIcons.utilityNotifications}
              style={styles.utilityIcon}
              resizeMode="contain"
            />
            {notifCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatBadgeCount(notifCount)}</Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push('/profile/profile')}
      >
        <Image source={figmaSharedIcons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={() => router.push('/settings/settings')}
      >
        <Image source={figmaSharedIcons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, itemCount: number) {
  const barHeight = s(263 + Math.max(0, itemCount - 3) * 65);

  return StyleSheet.create({
    utilityBar: {
      position: 'absolute',
      right: 0,
      top: s(28),
      width: s(84),
      height: barHeight,
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.utilityBar,
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    utilityBtn: {
      padding: s(4)
    },
    utilityIcon: {
      width: s(40),
      height: s(40)
    },
    badge: {
      position: 'absolute',
      top: s(-2),
      right: s(-4),
      minWidth: s(18),
      height: s(18),
      borderRadius: s(9),
      paddingHorizontal: s(4),
      backgroundColor: figmaColors.error,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: figmaColors.utilityBar
    },
    badgeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: s(10),
      lineHeight: s(12),
      color: '#FFFFFF',
      textAlign: 'center'
    }
  });
}
