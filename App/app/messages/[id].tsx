import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { publicProfileHref } from '@/constants/navigation';
import { forumMessageFontFamily } from '@/constants/discussionContent';
import { socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  blockUser,
  listConversationMessages,
  listInboxConversations,
  markConversationRead,
  reportCollectorMessage,
  sendMessage,
  type CollectorMessage
} from '@/lib/social';

export default function MessageConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [messages, setMessages] = useState<CollectorMessage[]>([]);
  const [peerName, setPeerName] = useState('Collector');
  const [peerId, setPeerId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    setError(null);

    const [msgRes, inboxRes] = await Promise.all([
      listConversationMessages(id),
      listInboxConversations()
    ]);

    if (msgRes.error) setError(msgRes.error);
    else setMessages(msgRes.items);

    const convo = inboxRes.items.find((row) => row.conversationId === id);
    if (convo) {
      setPeerName(convo.peerDisplayName);
      setPeerId(convo.peerId);
    }

    await markConversationRead(id);
    setLoading(false);
  }, [id, user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const submit = async () => {
    if (!id || !draft.trim()) return;
    setSending(true);
    const { error: sendError } = await sendMessage(id, draft);
    setSending(false);
    if (sendError) {
      setError(sendError);
      return;
    }
    setDraft('');
    await load();
  };

  const confirmBlock = () => {
    if (!peerId) return;
    const run = async () => {
      const { error: blockError } = await blockUser(peerId);
      if (blockError) setError(blockError);
      else router.back();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(socialCopy.conversation.blockConfirm)) void run();
      return;
    }
    Alert.alert('Block collector', socialCopy.conversation.blockConfirm, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => void run() }
    ]);
  };

  const reportConversation = () => {
    const lastOther = [...messages].reverse().find((m) => !m.isOwn);
    if (!lastOther) return;
    const prompt =
      Platform.OS === 'web'
        ? window.prompt(socialCopy.conversation.reportPrompt)
        : null;
    if (Platform.OS !== 'web') {
      Alert.prompt?.(
        'Report conversation',
        socialCopy.conversation.reportPrompt,
        async (reason) => {
          if (!reason?.trim()) return;
          await reportCollectorMessage(lastOther.id, reason);
          Alert.alert('Reported', socialCopy.conversation.reportSent);
        }
      );
      return;
    }
    if (prompt?.trim()) {
      void reportCollectorMessage(lastOther.id, prompt).then(() => {
        window.alert(socialCopy.conversation.reportSent);
      });
    }
  };

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={peerName}
        subtitle="PRIVATE CONVERSATION"
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <View style={styles.actionsRow}>
        {peerId ? (
          <Pressable onPress={() => router.push(publicProfileHref(peerId))} accessibilityRole="button">
            <Text style={styles.link}>View profile</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={confirmBlock} accessibilityRole="button">
          <Text style={styles.linkDestructive}>{socialCopy.conversation.block}</Text>
        </Pressable>
        <Pressable onPress={reportConversation} accessibilityRole="button">
          <Text style={styles.linkDestructive}>{socialCopy.conversation.report}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      ) : (
        <View style={styles.thread}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubbleRow, msg.isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}
            >
              {!msg.isOwn ? (
                <ProfileAvatar url={msg.senderAvatarUrl} name={msg.senderDisplayName} size={s(32)} />
              ) : null}
              <View style={[styles.bubble, msg.isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                <Text style={[styles.bubbleText, { fontFamily: forumMessageFontFamily() ?? appFonts.body }]}>
                  {msg.body}
                </Text>
                <Text style={styles.bubbleTime}>
                  {new Date(msg.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={socialCopy.conversation.placeholder}
          placeholderTextColor={figmaColors.gray}
          style={styles.composerInput}
          multiline
          maxLength={4000}
        />
        <Pressable
          onPress={() => void submit()}
          disabled={sending || !draft.trim()}
          style={[styles.sendBtn, (sending || !draft.trim()) && styles.sendBtnDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.sendBtnText}>{socialCopy.conversation.send}</Text>
        </Pressable>
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(12),
      marginBottom: s(12)
    },
    link: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    },
    linkDestructive: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.error,
      letterSpacing: 0.4
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    thread: { gap: s(10), marginBottom: s(16) },
    bubbleRow: { flexDirection: 'row', gap: s(8), alignItems: 'flex-end' },
    bubbleRowOwn: { justifyContent: 'flex-end' },
    bubbleRowOther: { justifyContent: 'flex-start' },
    bubble: {
      maxWidth: '82%',
      borderRadius: s(14),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      gap: s(4)
    },
    bubbleOwn: { backgroundColor: figmaColors.tabActiveBg },
    bubbleOther: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    bubbleText: {
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    bubbleTime: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.gray
    },
    composer: {
      flexDirection: 'row',
      gap: s(8),
      alignItems: 'flex-end',
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      paddingTop: s(12)
    },
    composerInput: {
      flex: 1,
      minHeight: s(44),
      maxHeight: s(120),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    sendBtn: {
      borderRadius: s(12),
      backgroundColor: figmaColors.buttonPrimaryBg,
      paddingHorizontal: s(14),
      paddingVertical: s(12)
    },
    sendBtnDisabled: { opacity: 0.5 },
    sendBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.charcoal,
      letterSpacing: 0.6
    }
  });
}
