import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { DiscussionThreadCard } from '@/components/figma/DiscussionThreadCard';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  discussionIcons,
  discussionSortFromTab,
  discussionTabHint,
  discussionTabs,
  formatCommentCount,
  formatVoteScore,
  type DiscussionTab
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import { discussionCreateHref, discussionThreadHref } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listSavedForumThreads } from '@/lib/forum';

export default function DiscussionSavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<DiscussionTab>(discussionTabs[0]);
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof listSavedForumThreads>>['items']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setThreads([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const sort = discussionSortFromTab(activeTab);
      const { items, error: err } = await listSavedForumThreads({ sort, limit: 50 });
      if (err) setError(err);
      else setThreads(items);

      setLoading(false);
      setRefreshing(false);
    },
    [activeTab, user]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    void load();
  }, [activeTab, load]);

  if (!user) {
    return (
      <FigmaScreen
        backgroundColor={figmaColors.background}
        bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
        scrollProps={{ contentContainerStyle: page.scrollContent }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.signInCard}>
          <Image
            source={discussionIcons.threadBookmark}
            style={styles.signInIcon}
            resizeMode="contain"
          />
          <Text style={styles.signInTitle}>Saved threads</Text>
          <Text style={styles.signInBody}>
            Sign in to bookmark discussions and find them here later.
          </Text>
          <AuthPrimaryButton label="Sign in" onPress={() => router.push('/sign-in/sign-in')} />
        </View>
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
      }}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Image
            source={discussionIcons.threadBookmark}
            style={styles.titleIcon}
            resizeMode="contain"
          />
          <View style={styles.titleText}>
            <Text style={styles.title}>Saved threads</Text>
            <Text style={styles.subtitle}>Your bookmarked discussions</Text>
          </View>
        </View>
      </View>

      <FigmaChipRow
        options={chipOptionsFromLabels(discussionTabs)}
        value={activeTab}
        onChange={setActiveTab}
        s={s}
        t={t}
        style={styles.chipRow}
      />

      <Text style={styles.hint}>{discussionTabHint(activeTab)}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && threads.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} />
      ) : threads.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No saved threads yet</Text>
          <Text style={styles.emptyBody}>
            Tap Save on any thread to keep it here for quick access.
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => router.push('/discussion/discussion')}>
            <Text style={styles.emptyButtonText}>Browse discussions</Text>
          </Pressable>
        </View>
      ) : (
        threads.map((thread) => {
          const authorName =
            thread.author_display_name || thread.author_username || 'Collector';
          return (
            <DiscussionThreadCard
              key={thread.id}
              avatarUrl={thread.author_avatar_url}
              authorName={authorName}
              title={thread.title}
              category={thread.topic_title}
              author={authorName}
              comments={formatCommentCount(thread.comment_count)}
              votes={formatVoteScore(thread.vote_score)}
              saved
              s={s}
              t={t}
              onPress={() => router.push(discussionThreadHref(thread.id))}
            />
          );
        })
      )}

      <Pressable style={page.ctaCard} onPress={() => router.push(discussionCreateHref())}>
        <Image source={discussionIcons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>START A THREAD</Text>
          <Text style={page.ctaBody}>Share evidence, ask questions, or spark a new conversation.</Text>
        </View>
        <Image source={discussionIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </Pressable>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    header: { marginBottom: s(4) },
    backText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12)
    },
    titleIcon: {
      width: s(28),
      height: s(32)
    },
    titleText: {
      flex: 1
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginTop: s(2)
    },
    chipRow: {
      marginTop: s(12),
      marginBottom: s(4)
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    loader: {
      marginVertical: s(20)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    emptyCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(20),
      marginBottom: s(16),
      alignItems: 'center'
    },
    emptyTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    emptyBody: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(14)
    },
    emptyButton: {
      height: s(40),
      borderRadius: s(20),
      paddingHorizontal: s(18),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emptyButtonText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.buttonPrimaryText
    },
    signInCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(24),
      alignItems: 'center',
      marginTop: s(20)
    },
    signInIcon: {
      width: s(32),
      height: s(36),
      marginBottom: s(12),
      opacity: 0.85
    },
    signInTitle: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    signInBody: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(18)
    }
  });
}
