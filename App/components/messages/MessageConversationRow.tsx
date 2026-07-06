import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { formatInboxWhen } from '@/lib/messaging-format';
import type { Conversation } from '@/lib/messages';

type Props = {
  conversation: Conversation;
  onPress: () => void;
  onPressAvatar?: () => void;
  active?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

function peerSubtitle(conversation: Conversation): string | null {
  if (conversation.peerRank != null) {
    return `Top Researcher • Rank #${conversation.peerRank}`;
  }
  return null;
}

export function MessageConversationRow({
  conversation,
  onPress,
  onPressAvatar,
  active = false,
  s,
  t
}: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const unread = conversation.unreadCount > 0;
  const subtitle = peerSubtitle(conversation);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        active && styles.rowActive,
        unread && !active && styles.rowUnread,
        pressed && styles.pressed
      ]}
      accessibilityRole="button"
    >
      {active ? <View style={styles.activeBar} /> : null}

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onPressAvatar?.();
        }}
        disabled={!onPressAvatar}
        accessibilityRole="button"
        accessibilityLabel={`Open ${conversation.peerDisplayName} profile`}
      >
        <ProfileAvatar
          url={conversation.peerAvatarUrl}
          name={conversation.peerDisplayName}
          size={s(52)}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.name, (unread || active) && styles.nameStrong]} numberOfLines={1}>
            {conversation.peerDisplayName}
          </Text>
          <Text style={[styles.when, unread && styles.whenUnread]}>
            {formatInboxWhen(conversation.lastMessageAt)}
          </Text>
        </View>

        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={2}>
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

type EmptyProps = {
  title: string;
  body: string;
  s: (n: number) => number;
  t: (n: number) => number;
  action?: React.ReactNode;
};

export function EmptyMessagesState({ title, body, s, t, action }: EmptyProps) {
  const styles = useMemo(() => createEmptyStyles(s, t), [s, t]);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {action}
    </View>
  );
}

export function MessageRequestCard({ s, t }: { s: (n: number) => number; t: (n: number) => number }) {
  return (
    <EmptyMessagesState
      s={s}
      t={t}
      title="No pending requests"
      body="Messages from collectors you do not follow will appear here when that feature is enabled."
    />
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      paddingVertical: s(14),
      paddingHorizontal: s(4),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      position: 'relative'
    },
    rowActive: {
      backgroundColor: 'rgba(232, 220, 200, 0.55)'
    },
    rowUnread: {
      backgroundColor: 'rgba(247, 241, 228, 0.72)'
    },
    pressed: { opacity: 0.88 },
    activeBar: {
      position: 'absolute',
      left: 0,
      top: s(8),
      bottom: s(8),
      width: s(4),
      borderRadius: s(2),
      backgroundColor: figmaColors.navActive
    },
    content: { flex: 1, minWidth: 0, gap: s(3) },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
    name: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    nameStrong: { fontFamily: appFonts.bodyBold },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.navActive
    },
    when: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray
    },
    whenUnread: {
      color: figmaColors.navActive,
      fontFamily: appFonts.bodyBold
    },
    preview: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(20),
      color: figmaColors.gray
    },
    previewUnread: {
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
      color: figmaColors.textOnDark
    }
  });
}

function createEmptyStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(20),
      gap: s(10)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray
    }
  });
}
