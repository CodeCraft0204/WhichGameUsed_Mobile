import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { DiscussionThreadCard } from '@/components/figma/DiscussionThreadCard';
import { ContextScrollView } from '@/components/context-header/ContextScrollView';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { ContextHeaderScrollProvider } from '@/context/ContextHeaderScrollContext';
import { DiscussionTopicCard } from '@/components/figma/DiscussionTopicCard';
import {
  discussionIcons,
  discussionSortFromTab,
  discussionTabHint,
  discussionTabs,
  discussionThreadsSectionTitle,
  formatCommentCount,
  formatVoteScore,
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
import { countForumFeedFilters, listFollowingForumThreads, listForumThreads, listForumTopics, searchForumThreads } from '@/lib/forum';

const SEARCH_DEBOUNCE_MS = 300;
const feedFilters = ['ALL', 'FOLLOWING'] as const;
type FeedFilter = (typeof feedFilters)[number];

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
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('ALL');

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
        : feedFilter === 'FOLLOWING'
          ? await listFollowingForumThreads({ sort, limit: 12 })
          : await listForumThreads({ sort, limit: 12 });

      if (threadsRes.error) setError(threadsRes.error);
      else setThreads(threadsRes.items);

      setThreadsLoading(false);
      setRefreshing(false);
    },
    [activeTab, debouncedSearch, feedFilter]
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
  }, [activeTab, debouncedSearch, feedFilter, loadThreads]);

  const sectionTitle =
    feedFilter === 'FOLLOWING' && !debouncedSearch
      ? 'FROM COLLECTORS YOU FOLLOW'
      : discussionThreadsSectionTitle(activeTab, Boolean(debouncedSearch));

  return (
    <ContextHeaderScrollProvider>
      <FigmaScreen
        backgroundColor={figmaColors.background}
        bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
        scrollable={false}
      >
        <View style={styles.page}>
          <View style={[page.scrollContent, styles.fixedTop]}>
            <FigmaPageHeader
              title="DISCUSSION"
              subtitle="HOBBY TALK WITHOUT THE DRAMA."
              description="Engage with the newest evidence, discuss past and future research findings, and align yourself with the hobby's best and brightest."
              heroSource={discussionIcons.hero}
              guidanceKey="discussion"
              s={s}
              page={page}
            />

          <View style={styles.stickyToolbar}>
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

            {!debouncedSearch && user ? (
              <FigmaChipRow
                options={chipOptionsFromLabels([...feedFilters])}
                value={feedFilter}
                onChange={(value) => setFeedFilter(value as FeedFilter)}
                s={s}
                t={t}
                style={styles.feedFilterRow}
              />
            ) : null}

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search threads…"
                placeholderTextColor={figmaColors.textMuted}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                accessibilityLabel="Search discussion threads"
                {...(Platform.OS === 'ios' ? { clearButtonMode: 'while-editing' as const } : {})}
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
              <Pressable
                style={styles.createButton}
                onPress={() => router.push(discussionCreateHref())}
              >
                <Text style={styles.createButtonText}>NEW</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ContextScrollView
          style={styles.contentScroll}
          contentContainerStyle={[page.scrollContent, styles.contentScrollInner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadAll(true)} />
          }
        >
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
                : feedFilter === 'FOLLOWING'
                  ? 'Follow collectors to see their threads here.'
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
                  votes={formatVoteScore(thread.vote_score)}
                  saved={thread.saved}
                  s={s}
                  t={t}
                  onPress={() => router.push(discussionThreadHref(thread.id))}
                />
              );
            })
          )}

          <View style={styles.quickLinksRow}>
            <Pressable
              style={styles.quickLinkCard}
              onPress={() => router.push(discussionSavedHref())}
              accessibilityRole="button"
              accessibilityLabel="View saved threads"
            >
              <Image
                source={discussionIcons.threadBookmark}
                style={styles.quickLinkIcon}
                resizeMode="contain"
              />
              <Text style={styles.quickLinkLabel} numberOfLines={2}>
                Saved threads
              </Text>
            </Pressable>

            <Pressable
              style={styles.quickLinkCard}
              onPress={() => router.push(discussionFeedPreferencesHref())}
              accessibilityRole="button"
              accessibilityLabel="Manage hidden content"
            >
              <Image
                source={discussionIcons.metaActivity}
                style={styles.quickLinkIcon}
                resizeMode="contain"
              />
              <Text style={styles.quickLinkLabel} numberOfLines={2}>
                {hiddenCount > 0 ? `Hidden (${hiddenCount})` : 'Hidden content'}
              </Text>
            </Pressable>
          </View>

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
        </ContextScrollView>
        </View>
      </FigmaScreen>
    </ContextHeaderScrollProvider>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    page: {
      flex: 1
    },
    fixedTop: {
      paddingBottom: 0
    },
    stickyToolbar: {
      backgroundColor: figmaColors.background,
      paddingBottom: s(8),
      zIndex: 2
    },
    contentScroll: {
      flex: 1
    },
    contentScrollInner: {
      paddingTop: s(4)
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: s(15)
    },
    chipFlex: {
      flex: 1,
      minWidth: 0
    },
    chipRow: {
      marginVertical: 0
    },
    feedFilterRow: {
      marginBottom: s(8)
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
      alignItems: 'center'
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      minHeight: s(42),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      borderRadius: s(12),
      paddingHorizontal: s(14),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.textPrimary,
      backgroundColor: figmaColors.cream,
      ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' as const } : {})
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
    quickLinksRow: {
      flexDirection: 'row',
      gap: s(18),
      marginTop: s(10)
    },
    quickLinkCard: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.ctaBackground,
      paddingVertical: s(12),
      paddingHorizontal: s(10)
    },
    quickLinkIcon: {
      width: s(16),
      height: s(18),
      opacity: 0.85,
      flexShrink: 0
    },
    quickLinkLabel: {
      flex: 1,
      minWidth: 0,
      fontFamily: appFonts.body,
      textAlign: 'center',
      fontWeight: 600,
      fontSize: t(18),
      lineHeight: t(16),
      color: figmaColors.charcoal
    }
  });
}
