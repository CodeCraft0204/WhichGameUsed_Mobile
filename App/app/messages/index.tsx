import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import {
  EmptyMessagesState,
  MessageConversationRow,
  MessageRequestCard
} from '@/components/messages/MessageConversationRow';
import { InboxSegmentTabs, type InboxSegment } from '@/components/social/InboxSegmentTabs';
import { MessageSearchField } from '@/components/social/MessageSearchField';
import { MessagesHubHeader } from '@/components/social/MessagesHubHeader';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { messageConversationHref, publicProfileHref } from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { subscribeConversationInbox } from '@/lib/message-realtime';
import { listConversations, searchConversations, type Conversation } from '@/lib/messages';

export default function MessagesIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<InboxSegment>('conversations');
  const [query, setQuery] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (!user) {
      setItems([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const result = query.trim()
      ? await searchConversations(query)
      : await listConversations();

    if (result.error) setError(result.error);
    else setItems(result.items);

    setLoading(false);
    setRefreshing(false);
  }, [query, user]);

  useFocusEffect(
    useCallback(() => {
      void load();
      void refreshCounts();
    }, [load, refreshCounts])
  );

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => void load(), 280);
    return () => clearTimeout(timer);
  }, [load, query, user]);

  useEffect(() => {
    if (!user) return;
    return subscribeConversationInbox(user.id, () => {
      void load(true);
      void refreshCounts();
    });
  }, [load, refreshCounts, user]);

  const openCompose = () => router.push('/profile/following');

  if (!user) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
        <MessagesHubHeader title={socialCopy.inbox.title} s={s} t={t} />
        <EmptyMessagesState
          s={s}
          t={t}
          title={socialCopy.inbox.signInTitle}
          body={socialCopy.inbox.signInBody}
          action={<AuthPrimaryButton label="Sign in" onPress={() => router.push('/sign-in/sign-in')} />}
        />
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen scrollable={false} bottomNav={<FigmaHubBottomNav active="leaderboard" />}>
      <View style={styles.page}>
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={[page.scrollContent, styles.listContent]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MessagesHubHeader
            title={socialCopy.inbox.title}
            s={s}
            t={t}
            onBack={() => router.back()}
            onCompose={openCompose}
          />

          <InboxSegmentTabs value={segment} onChange={setSegment} s={s} t={t} />

          {segment === 'conversations' ? (
            <>
              <MessageSearchField value={query} onChangeText={setQuery} s={s} t={t} />

              {error ? (
                <View style={styles.errorCard}>
                  <Text style={styles.error}>{error}</Text>
                  <Pressable onPress={() => void load()} accessibilityRole="button">
                    <Text style={styles.retry}>Try again</Text>
                  </Pressable>
                </View>
              ) : null}

              {loading && items.length === 0 ? (
                <ActivityIndicator size="large" color={figmaColors.charcoal} style={styles.loader} />
              ) : items.length === 0 ? (
                <EmptyMessagesState
                  s={s}
                  t={t}
                  title={query.trim() ? socialCopy.inbox.noSearchResults : socialCopy.inbox.emptyTitle}
                  body={query.trim() ? socialCopy.inbox.noSearchBody : socialCopy.inbox.emptyBody}
                />
              ) : (
                <View style={styles.listCard}>
                  {items.map((row) => (
                    <MessageConversationRow
                      key={row.id}
                      conversation={row}
                      s={s}
                      t={t}
                      onPress={() => router.push(messageConversationHref(row.id))}
                      onPressAvatar={() => router.push(publicProfileHref(row.peerId))}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <MessageRequestCard s={s} t={t} />
          )}
        </ScrollView>
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    page: { flex: 1 },
    listScroll: { flex: 1 },
    listContent: { paddingBottom: s(24) },
    listCard: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      overflow: 'hidden',
      paddingHorizontal: s(10)
    },
    loader: { marginTop: s(24) },
    errorCard: {
      backgroundColor: figmaColors.errorBg,
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      borderRadius: s(12),
      padding: s(14),
      gap: s(8),
      marginBottom: s(12)
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.error
    },
    retry: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.navActive,
      letterSpacing: 0.5
    }
  });
}
