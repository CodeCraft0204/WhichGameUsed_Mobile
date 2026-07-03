import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { messageTopicLabel } from '@/constants/socialCopy';
import type { InboxConversation } from '@/lib/social';

type ConversationListItemProps = {
  conversation: InboxConversation;
  onPress: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

function formatWhen(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ConversationListItem({ conversation, onPress, s, t }: ConversationListItemProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const unread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, unread && styles.unreadRow]}
      accessibilityRole="button"
    >
      <ProfileAvatar
        url={conversation.peerAvatarUrl}
        name={conversation.peerDisplayName}
        size={s(48)}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, unread && styles.unreadText]} numberOfLines={1}>
            {conversation.peerDisplayName}
          </Text>
          <Text style={styles.when}>{formatWhen(conversation.lastMessageAt)}</Text>
        </View>
        <Text style={styles.topic}>{messageTopicLabel(conversation.topic)}</Text>
        <Text style={[styles.preview, unread && styles.unreadPreview]} numberOfLines={2}>
          {conversation.lastMessagePreview ?? 'No messages yet'}
        </Text>
      </View>
      {unread ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    pressed: { opacity: 0.85 },
    unreadRow: { backgroundColor: figmaColors.cream },
    content: { flex: 1, minWidth: 0, gap: s(2) },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
    name: {
      flex: 1,
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    unreadText: { color: figmaColors.charcoal },
    when: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    },
    topic: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.navActive,
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    },
    preview: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      lineHeight: tb(20)
    },
    unreadPreview: {
      color: figmaColors.charcoal,
      fontFamily: appFonts.bodyBold
    },
    badge: {
      minWidth: s(22),
      height: s(22),
      borderRadius: s(11),
      backgroundColor: figmaColors.tabActiveBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(6)
    },
    badgeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(12),
      color: '#C9A84C'
    }
  });
}
