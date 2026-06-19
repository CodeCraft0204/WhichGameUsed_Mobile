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
  TextInput,
  View
} from 'react-native';
import { DiscussionThreadCard } from '@/components/figma/DiscussionThreadCard';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { DiscussionTopicCard } from '@/components/figma/DiscussionTopicCard';
import {
  discussionIcons,
  discussionSortFromTab,
  discussionTabHint,
  discussionTabs,
  discussionThreadsSectionTitle,
  formatCommentCount,
  formatClapCount,
  formatThreadCount,
  topicIconBySlug,
  type DiscussionTab
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import {
  discussionCreateHref,
  discussionFeedPreferencesHref,
  discussionSavedHref,
  discussionThreadHref,
  discussionTopicHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { countForumFeedFilters, listForumThreads, listForumTopics, searchForumThreads } from '@/lib/forum';

const SEARCH_DEBOUNCE_MS = 300;

export default function DiscussionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<DiscussionTab>(discussionTabs[0]);
  const [topics, setTopics] = useState<Awaited<ReturnType<typeof listForumTopics>>['items']>([]);
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof listForumThreads>>['items']>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTopics = useCallback(async () => {
    setTopicsLoading(true);
    const { items, error: err } = await listForumTopics();
    if (err) setError(err);
    else setTopics(items);
    setTopicsLoading(false);
  }, []);

  const loadThreads = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setThreadsLoading(true);
      setError(null);

      const sort = discussionSortFromTab(activeTab);
      const trimmed = debouncedSearch;
      const threadsRes = trimmed
        ? await searchForumThreads(trimmed, { sort, limit: 20 })
        : await listForumThreads({ sort, limit: 12 });

      if (threadsRes.error) setError(threadsRes.error);
      else setThreads(threadsRes.items);

      setThreadsLoading(false);
      setRefreshing(false);
    },
    [activeTab, debouncedSearch]
  );

  const loadAll = useCallback(
    async (isRefresh = false) => {
      const hiddenPromise = user
        ? countForumFeedFilters().then((res) => setHiddenCount(res.count))
        : Promise.resolve(setHiddenCount(0));
      await Promise.all([loadTopics(), loadThreads(isRefresh), hiddenPromise]);
    },
    [loadTopics, loadThreads, user]
  );

  useFocusEffect(
    useCallback(() => {
      void loadAll();
    }, [loadAll])
  );

  useEffect(() => {
    void loadThreads();
  }, [activeTab, debouncedSearch, loadThreads]);

  const sectionTitle = discussionThreadsSectionTitle(activeTab, Boolean(debouncedSearch));

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadAll(true)} />
        )
      }}
    >
      <FigmaPageHeader
        title="DISCUSSION"
        subtitle="HOBBY TALK WITHOUT THE DRAMA."
        description="Engage with the newest evidence, discuss past and future research findings, and align yourself with the hobby's best and brightest."
        heroSource={discussionIcons.hero}
        s={s}
        page={page}
      />

      <View style={styles.toolbarRow}>
        <View style={styles.chipFlex}>
          <FigmaChipRow
            options={chipOptionsFromLabels(discussionTabs)}
            value={activeTab}
            onChange={setActiveTab}
            s={s}
            t={t}
            style={styles.chipRow}
          />
        </View>
      </View>

      <Text style={styles.tabHint}>
        {debouncedSearch ? 'Matching threads across all topics.' : discussionTabHint(activeTab)}
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search threads…"
          placeholderTextColor={figmaColors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Pressable
          style={styles.savedButton}
          onPress={() => router.push(discussionSavedHref())}
          accessibilityRole="button"
          accessibilityLabel="Saved threads"
        >
          <Image
            source={discussionIcons.threadBookmark}
            style={styles.savedIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Pressable style={styles.createButton} onPress={() => router.push(discussionCreateHref())}>
          <Text style={styles.createButtonText}>NEW</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>TOPICS</Text>
      </View>

      {topicsLoading && topics.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} />
      ) : (
        topics.map((topic) => (
          <DiscussionTopicCard
            key={topic.id}
            icon={topicIconBySlug[topic.slug] ?? discussionIcons.topicAskAnything}
            title={topic.title}
            description={topic.description ?? ''}
            threadsLabel={formatThreadCount(topic.thread_count)}
            activityLabel={
              topic.last_activity_at
                ? `Active ${new Date(topic.last_activity_at).toLocaleDateString()}`
                : 'No activity yet'
            }
            s={s}
            t={t}
            onPress={() => router.push(discussionTopicHref(topic.slug))}
          />
        ))
      )}

      <View style={[page.sectionHeaderRow, styles.sectionSpaced]}>
        <Text style={page.sectionTitle}>{sectionTitle}</Text>
        {threadsLoading && threads.length > 0 ? (
          <ActivityIndicator color={figmaColors.gray} size="small" />
        ) : null}
      </View>

      {threadsLoading && threads.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} />
      ) : threads.length === 0 ? (
        <Text style={styles.emptyText}>
          {debouncedSearch
            ? 'No threads match your search.'
            : 'No threads yet. Start the conversation.'}
        </Text>
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
              claps={formatClapCount(thread.total_claps)}
              saved={thread.saved}
              s={s}
              t={t}
              onPress={() => router.push(discussionThreadHref(thread.id))}
            />
          );
        })
      )}

      <Pressable style={styles.savedLinkRow} onPress={() => router.push(discussionSavedHref())}>
        <Image
          source={discussionIcons.threadBookmark}
          style={styles.savedLinkIcon}
          resizeMode="contain"
        />
        <Text style={styles.savedLinkText}>View saved threads</Text>
        <Image source={discussionIcons.cardChevron} style={styles.savedLinkChevron} resizeMode="contain" />
      </Pressable>

      <Pressable
        style={styles.savedLinkRow}
        onPress={() => router.push(discussionFeedPreferencesHref())}
      >
        <Image
          source={discussionIcons.metaActivity}
          style={styles.savedLinkIcon}
          resizeMode="contain"
        />
        <Text style={styles.savedLinkText}>
          {hiddenCount > 0 ? `Manage hidden content (${hiddenCount})` : 'Manage hidden content'}
        </Text>
        <Image source={discussionIcons.cardChevron} style={styles.savedLinkChevron} resizeMode="contain" />
      </Pressable>

      <Pressable style={page.ctaCard} onPress={() => router.push(discussionCreateHref())}>
        <Image source={discussionIcons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>THREADING THE NEEDLE.</Text>
          <Text style={page.ctaBody}>
            Share what you know, question what you don't, and help the hobby get smarter.
          </Text>
        </View>
        <Image source={discussionIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </Pressable>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: s(4)
    },
    chipFlex: {
      flex: 1,
      minWidth: 0
    },
    chipRow: {
      marginVertical: 0
    },
    tabHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginTop: s(8),
      marginBottom: s(4)
    },
    searchRow: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: s(8),
      marginBottom: s(12),
      alignItems: 'center'
    },
    searchInput: {
      flex: 1,
      height: s(42),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(21),
      paddingHorizontal: s(14),
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.background
    },
    savedButton: {
      width: s(42),
      height: s(42),
      borderRadius: s(21),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cardFeaturedBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    savedIcon: {
      width: s(14),
      height: s(17),
      opacity: 0.85
    },
    createButton: {
      height: s(42),
      minWidth: s(56),
      borderRadius: s(21),
      paddingHorizontal: s(14),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    createButtonText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.buttonPrimaryText
    },
    sectionSpaced: {
      marginTop: s(4)
    },
    loader: {
      marginVertical: s(16)
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    savedLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cardFeaturedBg,
      paddingVertical: s(12),
      paddingHorizontal: s(14),
      marginTop: s(15)
    },
    savedLinkIcon: {
      width: s(14),
      height: s(17),
      opacity: 0.8
    },
    savedLinkText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    savedLinkChevron: {
      width: s(8),
      height: s(12),
      opacity: 0.5
    }
  });
}
