import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
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
  discussionTabs,
  formatCommentCount,
  formatThreadCount,
  topicIconBySlug,
  type DiscussionTab
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import {
  discussionCreateHref,
  discussionThreadHref,
  discussionTopicHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listForumThreads, listForumTopics, searchForumThreads } from '@/lib/forum';

export default function DiscussionScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<DiscussionTab>(discussionTabs[0]);
  const [topics, setTopics] = useState<Awaited<ReturnType<typeof listForumTopics>>['items']>([]);
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof listForumThreads>>['items']>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const sort = discussionSortFromTab(activeTab);
    const trimmed = search.trim();
    const [topicsRes, threadsRes] = await Promise.all([
      listForumTopics(),
      trimmed
        ? searchForumThreads(trimmed, 20)
        : listForumThreads({ sort, limit: 12 })
    ]);

    if (topicsRes.error) setError(topicsRes.error);
    else setTopics(topicsRes.items);
    if (threadsRes.error) setError(threadsRes.error);
    else setThreads(threadsRes.items);

    setLoading(false);
    setRefreshing(false);
  }, [activeTab, search]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
      }}
    >
      <FigmaPageHeader
        title="DISCUSSION"
        subtitle="HOBBY TALK WITHOUT THE DRAMA."
        description="Engage with the newest evidence, discuss past and future research findings, and align yourself with the hobby's best and brightest."
        heroSource={discussionIcons.hero}
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(discussionTabs)}
          value={activeTab}
          onChange={setActiveTab}
          s={s}
          t={t}
          style={styles.chipRow}
        />
      </FigmaPageHeader>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search threads…"
          placeholderTextColor={figmaColors.textMuted}
          returnKeyType="search"
          onSubmitEditing={() => void load()}
        />
        <Pressable style={styles.createButton} onPress={() => router.push(discussionCreateHref())}>
          <Text style={styles.createButtonText}>NEW THREAD</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>TOPICS</Text>
      </View>

      {loading && topics.length === 0 ? (
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
        <Text style={page.sectionTitle}>{search.trim() ? 'SEARCH RESULTS' : 'ACTIVE THREADS'}</Text>
      </View>

      {loading && threads.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} />
      ) : threads.length === 0 ? (
        <Text style={styles.emptyText}>No threads yet. Start the conversation.</Text>
      ) : (
        threads.map((thread) => (
          <DiscussionThreadCard
            key={thread.id}
            avatarUrl={thread.author_avatar_url}
            title={thread.title}
            category={thread.topic_title}
            author={thread.author_display_name || thread.author_username || 'Collector'}
            comments={formatCommentCount(thread.comment_count)}
            saved={thread.saved}
            s={s}
            t={t}
            onPress={() => router.push(discussionThreadHref(thread.id))}
          />
        ))
      )}

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
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
    },
    searchRow: {
      flexDirection: 'row',
      gap: s(10),
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
    createButton: {
      height: s(42),
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
    }
  });
}
