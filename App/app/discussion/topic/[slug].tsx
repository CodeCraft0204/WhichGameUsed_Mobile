import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
  View
} from 'react-native';
import { DiscussionThreadCard } from '@/components/figma/DiscussionThreadCard';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  discussionIcons,
  discussionSortFromTab,
  discussionTabs,
  formatCommentCount,
  topicIconBySlug,
  type DiscussionTab
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import { discussionCreateHref, discussionThreadHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listForumThreads, listForumTopics } from '@/lib/forum';

export default function DiscussionTopicScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState<DiscussionTab>(discussionTabs[0]);
  const [topicTitle, setTopicTitle] = useState('');
  const [threads, setThreads] = useState<Awaited<ReturnType<typeof listForumThreads>>['items']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    const sort = discussionSortFromTab(activeTab);
    const [topicsRes, threadsRes] = await Promise.all([
      listForumTopics(),
      listForumThreads({ topicSlug: slug, sort, limit: 50 })
    ]);
    const topic = topicsRes.items.find((row) => row.slug === slug);
    setTopicTitle(topic?.title ?? slug);
    if (threadsRes.error) setError(threadsRes.error);
    else setThreads(threadsRes.items);
    setLoading(false);
  }, [slug, activeTab]);

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
        refreshControl: <RefreshControl refreshing={loading} onRefresh={() => void load()} />
      }}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Image
            source={topicIconBySlug[slug ?? ''] ?? discussionIcons.topicAskAnything}
            style={styles.topicIcon}
            resizeMode="contain"
          />
          <Text style={styles.title}>{topicTitle}</Text>
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

      <Pressable
        style={styles.createButton}
        onPress={() => router.push(discussionCreateHref(slug))}
      >
        <Text style={styles.createButtonText}>START A THREAD</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading && threads.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} />
      ) : threads.length === 0 ? (
        <Text style={styles.emptyText}>No threads in this topic yet.</Text>
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
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    header: { marginBottom: s(8) },
    backText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10)
    },
    topicIcon: {
      width: s(48),
      height: s(48)
    },
    title: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal
    },
    chipRow: { marginVertical: s(12) },
    createButton: {
      alignSelf: 'flex-start',
      marginBottom: s(12),
      height: s(40),
      borderRadius: s(20),
      paddingHorizontal: s(16),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    createButtonText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.buttonPrimaryText
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginBottom: s(12)
    }
  });
}
