import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { ConversationListItem } from '@/components/social/ConversationListItem';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { figmaColors } from '@/constants/figmaColors';
import {
  messageConversationHref,
  socialNotificationsHref
} from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listInboxConversations } from '@/lib/social';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { Pressable } from 'react-native';

export default function MessagesInboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<Awaited<ReturnType<typeof listInboxConversations>>['items']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const { items: rows, error: err } = await listInboxConversations();
    if (err) setError(err);
    else setItems(rows);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(useCallback(() => {
    void load();
    void refreshCounts();
  }, [load, refreshCounts]));

  if (!user) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
        <ProfileSubpageHeader
          title={socialCopy.inbox.title}
          subtitle={socialCopy.inbox.subtitle}
          description={socialCopy.inbox.description}
          s={s}
          t={t}
          onBack={() => router.back()}
        />
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{socialCopy.inbox.signInTitle}</Text>
          <Text style={styles.emptyBody}>{socialCopy.inbox.signInBody}</Text>
          <AuthPrimaryButton label="Sign in" onPress={() => router.push('/sign-in/sign-in')} />
        </View>
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
      }}
    >
      <ProfileSubpageHeader
        title={socialCopy.inbox.title}
        subtitle={socialCopy.inbox.subtitle}
        description={socialCopy.inbox.description}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <Pressable
        onPress={() => router.push(socialNotificationsHref())}
        style={styles.notificationsLink}
        accessibilityRole="button"
      >
        <Text style={styles.notificationsLinkText}>{socialCopy.settings.notificationsLink} ›</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={figmaColors.charcoal} style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{socialCopy.inbox.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{socialCopy.inbox.emptyBody}</Text>
        </View>
      ) : (
        <View>
          {items.map((row) => (
            <ConversationListItem
              key={row.conversationId}
              conversation={row}
              s={s}
              t={t}
              onPress={() => router.push(messageConversationHref(row.conversationId))}
            />
          ))}
        </View>
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    loader: { marginTop: s(24) },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    emptyCard: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(20),
      gap: s(10)
    },
    emptyTitle: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal
    },
    emptyBody: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    notificationsLink: { marginBottom: s(12) },
    notificationsLinkText: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    }
  });
}
