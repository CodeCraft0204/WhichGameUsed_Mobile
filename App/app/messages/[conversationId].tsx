import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { MessageHeader } from '@/components/messages/MessageHeader';
import { EmptyMessagesState } from '@/components/messages/MessageConversationRow';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { messageConversationHref, messagesInboxHref, publicProfileHref, safeGoBack } from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { subscribeConversationThread } from '@/lib/message-realtime';
import { buildMessageListItems, type MessageListItem } from '@/lib/messaging-format';
import {
  archiveConversation,
  blockUser,
  getConversation,
  listMessages,
  markConversationRead,
  reportMessage,
  sendMessage,
  type Conversation,
  type Message
} from '@/lib/messages';
import {
  getProfilesPresence,
  subscribeProfilePresence,
  type PresenceStatus
} from '@/lib/presence';

export default function MessageThreadScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const listRef = useRef<FlatList<MessageListItem>>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [peerPresence, setPeerPresence] = useState<PresenceStatus>('offline');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPeerPresence = useCallback(async (peerId: string | null | undefined) => {
    if (!peerId) {
      setPeerPresence('offline');
      return;
    }
    const { items } = await getProfilesPresence([peerId]);
    setPeerPresence(items[0]?.effectiveStatus ?? 'offline');
  }, []);

  const listItems = useMemo(() => buildMessageListItems(messages), [messages]);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const load = useCallback(async () => {
    if (!conversationId || !user) return;
    setError(null);

    const [msgRes, convoRes] = await Promise.all([
      listMessages(conversationId),
      getConversation(conversationId)
    ]);

    setConversation(convoRes.conversation);
    if (convoRes.conversation) {
      setPeerPresence(convoRes.conversation.peerPresence);
      void refreshPeerPresence(convoRes.conversation.peerId);
    }
    if (msgRes.error) {
      setError(msgRes.error);
      setMessages([]);
    } else {
      setMessages(msgRes.items);
    }

    await markConversationRead(conversationId);
    await refreshCounts();
    setLoading(false);
    scrollToLatest();
  }, [conversationId, refreshCounts, refreshPeerPresence, scrollToLatest, user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load])
  );

  useEffect(() => {
    if (!conversationId) return;
    return subscribeConversationThread(conversationId, () => {
      // Soft refresh — keep the thread open; pick up hide/restore and new messages.
      void load();
    });
  }, [conversationId, load]);

  useEffect(() => {
    const peerId = conversation?.peerId;
    if (!peerId) return;
    const unsub = subscribeProfilePresence(peerId, () => {
      void refreshPeerPresence(peerId);
    });
    const interval = setInterval(() => {
      void refreshPeerPresence(peerId);
    }, 60_000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [conversation?.peerId, refreshPeerPresence]);

  const submit = async () => {
    if (!conversationId || !draft.trim()) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');

    const optimistic: Message = {
      id: `local-${Date.now()}`,
      conversationId,
      senderId: user!.id,
      body,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      attachmentUrl: null,
      attachmentType: null,
      senderDisplayName: 'You',
      senderAvatarUrl: null,
      isOwn: true
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToLatest();

    const { error: sendError } = await sendMessage(conversationId, body);
    setSending(false);
    if (sendError) {
      setError(sendError);
      setMessages((prev) => prev.filter((row) => row.id !== optimistic.id));
      setDraft(body);
      return;
    }
    await load();
  };

  const peerSubtitle =
    conversation?.peerRank != null
      ? `Top Researcher • Rank #${conversation.peerRank}`
      : null;

  const confirmBlock = () => {
    const peerId = conversation?.peerId;
    if (!peerId) return;
    const run = async () => {
      const { error: blockError } = await blockUser(peerId);
      if (blockError) setError(blockError);
      else router.replace(messagesInboxHref());
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

  const archiveThread = async () => {
    if (!conversationId) return;
    const { error: archiveError } = await archiveConversation(conversationId, true);
    if (archiveError) setError(archiveError);
    else router.replace(messagesInboxHref());
  };

  const reportConversation = () => {
    const lastOther = [...messages].reverse().find((m) => !m.isOwn);
    if (!lastOther) return;
    if (Platform.OS === 'web') {
      const prompt = window.prompt(socialCopy.conversation.reportPrompt);
      if (prompt?.trim()) {
        void reportMessage(lastOther.id, prompt).then(() => {
          window.alert(socialCopy.conversation.reportSent);
        });
      }
      return;
    }
    Alert.prompt?.(
      'Report conversation',
      socialCopy.conversation.reportPrompt,
      async (reason) => {
        if (!reason?.trim()) return;
        await reportMessage(lastOther.id, reason);
        Alert.alert('Reported', socialCopy.conversation.reportSent);
      }
    );
  };

  const openMenu = () => {
    const options = [
      socialCopy.conversation.viewProfile,
      'Archive conversation',
      socialCopy.conversation.report,
      socialCopy.conversation.block,
      'Cancel'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 4, destructiveButtonIndex: 3 },
        (index) => {
          if (index === 0 && conversation?.peerId) {
            router.push(publicProfileHref(conversation.peerId));
          } else if (index === 1) void archiveThread();
          else if (index === 2) reportConversation();
          else if (index === 3) confirmBlock();
        }
      );
      return;
    }

    Alert.alert('Conversation', undefined, [
      conversation?.peerId
        ? {
            text: socialCopy.conversation.viewProfile,
            onPress: () => router.push(publicProfileHref(conversation.peerId))
          }
        : undefined,
      { text: 'Archive conversation', onPress: () => void archiveThread() },
      { text: socialCopy.conversation.report, onPress: reportConversation },
      { text: socialCopy.conversation.block, style: 'destructive', onPress: confirmBlock },
      { text: 'Cancel', style: 'cancel' }
    ].filter(Boolean) as Parameters<typeof Alert.alert>[2]);
  };

  const renderItem = ({ item }: { item: MessageListItem }) => {
    if (item.type === 'date') {
      return (
        <View style={styles.dateRow}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    return <MessageBubble message={item.message} showAvatar={item.showAvatar} s={s} t={t} />;
  };

  const peerName = conversation?.peerDisplayName ?? 'Collector';

  return (
    <FigmaScreen scrollable={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <MessageHeader
          displayName={peerName}
          avatarUrl={conversation?.peerAvatarUrl ?? null}
          subtitle={peerSubtitle}
          presence={peerPresence}
          s={s}
          t={t}
          onBack={() => safeGoBack(messagesInboxHref())}
          onPressProfile={
            conversation?.peerId
              ? () => router.push(publicProfileHref(conversation.peerId))
              : undefined
          }
          onPressMenu={openMenu}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && messages.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={figmaColors.charcoal} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={listItems}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            style={styles.thread}
            contentContainerStyle={styles.threadContent}
            onContentSizeChange={scrollToLatest}
            onLayout={scrollToLatest}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EmptyMessagesState
                s={s}
                t={t}
                title={socialCopy.conversation.emptyTitle}
                body={socialCopy.conversation.emptyBody}
              />
            }
          />
        )}

        <MessageComposer
          value={draft}
          onChangeText={setDraft}
          onSend={() => void submit()}
          placeholder={socialCopy.conversation.placeholder}
          sending={sending}
          s={s}
          t={t}
        />
      </KeyboardAvoidingView>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    flex: { flex: 1 },
    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.error,
      paddingHorizontal: s(16),
      paddingTop: s(8)
    },
    thread: { flex: 1, backgroundColor: figmaColors.parchment },
    threadContent: {
      paddingHorizontal: s(14),
      paddingTop: s(12),
      paddingBottom: s(16),
      flexGrow: 1
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      marginVertical: s(12)
    },
    dateLine: { flex: 1, height: 1, backgroundColor: figmaColors.divider },
    dateLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    }
  });
}
