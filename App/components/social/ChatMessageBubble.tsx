import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { forumMessageFontFamily } from '@/constants/discussionContent';
import { formatMessageTime } from '@/lib/messaging-format';
import type { Message } from '@/lib/messages';

type Props = {
  message: Message;
  showAvatar: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ChatMessageBubble({ message, showAvatar, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const own = message.isOwn;

  return (
    <View style={[styles.row, own ? styles.rowOwn : styles.rowOther]}>
      {!own && showAvatar ? (
        <ProfileAvatar url={message.senderAvatarUrl} name={message.senderDisplayName} size={s(34)} />
      ) : !own ? (
        <View style={styles.avatarSpacer} />
      ) : null}

      <View style={[styles.bubble, own ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text
          style={[styles.body, own ? styles.bodyOwn : styles.bodyOther]}
        >
          {message.body}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, own ? styles.timeOwn : styles.timeOther]}>
            {formatMessageTime(message.createdAt)}
          </Text>
          {own ? <Text style={styles.readReceipt}>✓✓</Text> : null}
        </View>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  const messageFont = forumMessageFontFamily() ?? appFonts.body;

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(8),
      marginBottom: s(8)
    },
    rowOwn: {
      justifyContent: 'flex-end'
    },
    rowOther: {
      justifyContent: 'flex-start'
    },
    avatarSpacer: {
      width: s(34)
    },
    bubble: {
      maxWidth: '78%',
      borderRadius: s(16),
      paddingHorizontal: s(14),
      paddingTop: s(10),
      paddingBottom: s(8)
    },
    bubbleOwn: {
      backgroundColor: figmaColors.tabActiveBg,
      borderBottomRightRadius: s(6)
    },
    bubbleOther: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderBottomLeftRadius: s(6)
    },
    body: {
      fontFamily: messageFont,
      fontSize: tb(16),
      lineHeight: tb(22)
    },
    bodyOwn: {
      color: figmaColors.textOnDark
    },
    bodyOther: {
      color: figmaColors.charcoal
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: s(6),
      marginTop: s(4)
    },
    time: {
      fontFamily: appFonts.body,
      fontSize: tb(11)
    },
    timeOwn: {
      color: 'rgba(247, 241, 228, 0.78)'
    },
    timeOther: {
      color: figmaColors.gray
    },
    readReceipt: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: 'rgba(247, 241, 228, 0.88)',
      letterSpacing: -1
    }
  });
}
