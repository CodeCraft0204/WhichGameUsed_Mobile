import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CommentComposer } from '@/components/discussion/CommentComposer';
import { DiscussionMoreSheet } from '@/components/discussion/DiscussionMoreSheet';
import { ForumUserText } from '@/components/discussion/ForumUserText';
import {
  ReportContentSheet,
  type ReportSheetTarget
} from '@/components/discussion/ReportContentSheet';
import { ThreadEngagementBar } from '@/components/discussion/ThreadEngagementBar';
import { DonutGiftButton } from '@/components/reputation/DonutGiftButton';
import { DetectiveRankMini } from '@/components/reputation/DetectiveRankMini';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { fetchReputationRankLevels } from '@/lib/reputation';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  forumReportReasonLabel,
  type ForumReportReasonKey
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import { discussionFeedPreferencesHref } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useForumThreadCommentsRealtime } from '@/hooks/useForumThreadCommentsRealtime';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
// Star/clap feature disabled in mobile UI.
// import { useThreadClaps } from '@/hooks/useThreadClaps';
import {
  computeVoteScoreAfterAction,
  createForumComment,
  getForumThread,
  hideForumThreadLess,
  listForumThreadComments,
  reportForumContent,
  toggleForumThreadSave,
  voteForumThread,
  type ForumThreadDetail
} from '@/lib/forum';

type ReportTarget = ReportSheetTarget;

export default function DiscussionThreadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [thread, setThread] = useState<ForumThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [rankLevels, setRankLevels] = useState<Record<string, number>>({});

  /*
  const claps = useThreadClaps({
    threadId: id ?? '',
    initialTotalClaps: thread?.total_claps ?? 0,
    initialUserClaps: thread?.user_clap_count ?? 0,
    enabled: Boolean(user && thread),
    onSynced: ({ total_claps, user_clap_count }) => {
      setThread((prev) =>
        prev ? { ...prev, total_claps, user_clap_count } : prev
      );
    },
    onError: (message) => Alert.alert('Clap failed', message)
  });
  */

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id) return;
    if (!opts?.silent) {
      setLoading(true);
      setError(null);
    }
    const { thread: data, error: err } = await getForumThread(id);
    if (err) setError(err);
    else {
      setThread(data);
      if (data) {
        const authorIds = [
          data.author_id,
          ...data.comments.map((c) => c.author_id)
        ].filter((x): x is string => Boolean(x));
        const ranks = await fetchReputationRankLevels(authorIds);
        const map: Record<string, number> = {};
        for (const [uid, row] of Object.entries(ranks.levels)) {
          map[uid] = row.rankLevel;
        }
        setRankLevels(map);
      }
    }
    if (!opts?.silent) setLoading(false);
  }, [id]);

  const refreshComments = useCallback(async () => {
    if (!id) return;
    const { comments, error: err } = await listForumThreadComments(id);
    if (err) {
      setError(err);
      return;
    }
    setThread((prev) => (prev ? { ...prev, comments } : prev));
  }, [id]);

  useForumThreadCommentsRealtime(id, () => {
    void refreshComments();
  }, Boolean(thread));

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function requireSignedIn(action: () => void) {
    if (user) {
      action();
      return;
    }
    Alert.alert('Sign in required', 'Create an account or sign in to participate.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign in', onPress: () => router.push('/sign-in/sign-in') }
    ]);
  }

  async function submitReply() {
    if (!id || !reply.trim()) return;
    if (!user) {
      requireSignedIn(() => {});
      return;
    }
    setBusy(true);
    const { error: err } = await createForumComment({ threadId: id, body: reply.trim() });
    setBusy(false);
    if (err) {
      Alert.alert('Could not post reply', err);
      return;
    }
    setReply('');
    await refreshComments();
  }

  async function handleSave() {
    if (!id || busy) return;
    requireSignedIn(() => {
      void (async () => {
        setBusy(true);
        const { saved, error: err } = await toggleForumThreadSave(id);
        setBusy(false);
        if (err) {
          Alert.alert('Save failed', err);
          return;
        }
        setThread((prev) => (prev ? { ...prev, saved } : prev));
      })();
    });
  }

  /*
  function handleClapPressIn() {
    requireSignedIn(() => claps.onPressIn());
  }
  */

  function handleVote(value: 'upvote' | 'downvote') {
    if (!id) return;
    requireSignedIn(() => {
      void (async () => {
        const { error: err, user_vote, vote_score } = await voteForumThread(id, value);
        if (err) {
          Alert.alert('Vote failed', err);
          return;
        }
        setThread((prev) => {
          if (!prev) return prev;
          const fallback = computeVoteScoreAfterAction(prev.vote_score, prev.user_vote, value);
          return {
            ...prev,
            user_vote: user_vote ?? fallback.user_vote,
            vote_score: vote_score ?? fallback.vote_score
          };
        });
      })();
    });
  }

  function handleShowLess() {
    if (!id) return;
    requireSignedIn(() => {
      Alert.alert(
        'Show less like this?',
        'We will hide this thread, its topic, and posts from this author in your discussion feed.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Show less',
            onPress: () => {
              void (async () => {
                const { error: err } = await hideForumThreadLess(id);
                if (err) {
                  Alert.alert('Could not update feed', err);
                  return;
                }
                Alert.alert(
                  'Feed updated',
                  'You will see less content like this. You can undo this anytime from Manage hidden content in thread options.'
                );
                router.back();
              })();
            }
          }
        ]
      );
    });
  }

  function openManageHidden() {
    setMoreOpen(false);
    router.push(discussionFeedPreferencesHref());
  }

  function openThreadFlag() {
    if (!thread) return;
    setMoreOpen(false);
    requireSignedIn(() =>
      setReportTarget({
        type: 'forum_thread',
        id: thread.id,
        headline: 'This discussion thread',
        preview: thread.title
      })
    );
  }

  function openCommentFlag(comment: ForumThreadDetail['comments'][number]) {
    const author =
      comment.author_display_name || comment.author_username || 'Collector';
    requireSignedIn(() =>
      setReportTarget({
        type: 'forum_comment',
        id: comment.id,
        headline: `Reply from ${author}`,
        preview: comment.body
      })
    );
  }

  function openMoreMenu() {
    requireSignedIn(() => setMoreOpen(true));
  }

  async function submitReport(reasonKey: ForumReportReasonKey, notes: string) {
    if (!reportTarget) return;
    setReportBusy(true);
    const { error: err } = await reportForumContent({
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: forumReportReasonLabel(reasonKey, notes)
    });
    setReportBusy(false);
    if (err) {
      Alert.alert('Report failed', err);
      return;
    }
    setReportTarget(null);
    Alert.alert('Sent to moderators', 'Thanks — we will review this privately.');
  }

  if (loading && !thread) {
    return (
      <FigmaScreen backgroundColor={figmaColors.background} bottomNav={<FigmaDatabaseBottomNav active="discussion" />}>
        <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(40) }} />
      </FigmaScreen>
    );
  }

  if (!thread) {
    return (
      <FigmaScreen backgroundColor={figmaColors.background} bottomNav={<FigmaDatabaseBottomNav active="discussion" />}>
        <Text style={styles.errorText}>{error ?? 'Thread not found.'}</Text>
      </FigmaScreen>
    );
  }

  const author =
    thread.author_display_name || thread.author_username || 'Collector';

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollable={false}
    >
      <KeyboardAvoidingView
        style={styles.page}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        <View style={[page.scrollContent, styles.postSection]}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.threadHeader}>
            <View style={{ position: 'relative' }}>
              <ProfileAvatar url={thread.author_avatar_url} name={author} size={s(56)} />
              {thread.author_id ? (
                <View style={{ position: 'absolute', right: -4, bottom: -4 }}>
                  <DetectiveRankMini level={rankLevels[thread.author_id] ?? 1} s={s} size={24} />
                </View>
              ) : null}
            </View>
            <View style={styles.headerBody}>
              <View style={styles.topicTag}>
                <Text style={styles.topicTagText}>{thread.topic_title}</Text>
              </View>
              <Text style={styles.title}>{thread.title}</Text>
              <Text style={styles.meta}>
                by {author} · {new Date(thread.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <ForumUserText t={t} style={styles.body}>
            {thread.body}
          </ForumUserText>

          <ThreadEngagementBar
            voteScore={thread.vote_score}
            userVote={thread.user_vote}
            onUpvote={() => handleVote('upvote')}
            onDownvote={() => handleVote('downvote')}
            saved={Boolean(thread.saved)}
            onSave={() => void handleSave()}
            onMore={openMoreMenu}
            disabled={busy}
            style={styles.engagementBar}
            s={s}
            t={t}
          />

          {user && thread.author_id && thread.author_id !== user.id ? (
            <DonutGiftButton
              toUserId={thread.author_id}
              targetType="forum_thread"
              targetId={thread.id}
              s={s}
              t={t}
            />
          ) : null}
        </View>

        <ScrollView
          style={styles.commentsScroll}
          contentContainerStyle={[page.scrollContent, styles.commentsScrollInner]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void (async () => {
                  setRefreshing(true);
                  await load({ silent: true });
                  setRefreshing(false);
                })();
              }}
            />
          }
        >
          <Text style={styles.sectionTitle}>COMMENTS ({thread.comments.length})</Text>

          {thread.comments.length === 0 ? (
            <Text style={styles.emptyComments}>No replies yet — be the first to reply.</Text>
          ) : (
            thread.comments.map((comment) => {
              const commentAuthor =
                comment.author_display_name || comment.author_username || 'Collector';
              return (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={{ position: 'relative' }}>
                      <ProfileAvatar
                        url={comment.author_avatar_url}
                        name={commentAuthor}
                        size={s(40)}
                      />
                      {comment.author_id ? (
                        <View style={{ position: 'absolute', right: -4, bottom: -4 }}>
                          <DetectiveRankMini
                            level={rankLevels[comment.author_id] ?? 1}
                            s={s}
                            size={18}
                          />
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.commentHeaderText}>
                      <Text style={styles.commentAuthor}>{commentAuthor}</Text>
                      <Text style={styles.commentMeta}>
                        {new Date(comment.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.commentMore}
                      onPress={() => openCommentFlag(comment)}
                      accessibilityRole="button"
                      accessibilityLabel="Comment options"
                    >
                      <Text style={styles.commentMoreIcon}>⋯</Text>
                    </Pressable>
                  </View>
                  <ForumUserText t={t} variant="comment" style={styles.commentBody}>
                    {comment.body}
                  </ForumUserText>
                  {user && comment.author_id && comment.author_id !== user.id ? (
                    <DonutGiftButton
                      toUserId={comment.author_id}
                      targetType="forum_comment"
                      targetId={comment.id}
                      s={s}
                      t={t}
                    />
                  ) : null}
                </View>
              );
            })
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        {thread.is_locked ? (
          <View style={[page.scrollContent, styles.composerDock]}>
            <Text style={styles.lockedText}>This thread is locked — new replies are disabled.</Text>
          </View>
        ) : (
          <View style={[page.scrollContent, styles.composerDock]}>
            <CommentComposer
              value={reply}
              onChangeText={setReply}
              onSubmit={() => void submitReply()}
              busy={busy}
              s={s}
              t={t}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <DiscussionMoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onShowLess={() => {
          setMoreOpen(false);
          handleShowLess();
        }}
        onManageHidden={openManageHidden}
        onFlagContent={openThreadFlag}
        s={s}
        t={t}
      />

      <ReportContentSheet
        visible={reportTarget != null}
        target={reportTarget}
        busy={reportBusy}
        onClose={() => setReportTarget(null)}
        onSubmit={submitReport}
        s={s}
        t={t}
      />
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    page: {
      flex: 1
    },
    postSection: {
      flexShrink: 0,
      paddingBottom: s(8),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    commentsScroll: {
      flex: 1
    },
    commentsScrollInner: {
      paddingTop: s(12),
      paddingBottom: s(8),
      flexGrow: 0
    },
    composerDock: {
      flexShrink: 0,
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      backgroundColor: figmaColors.background,
      paddingTop: s(10),
      paddingBottom: s(10)
    },
    backText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    threadHeader: {
      flexDirection: 'row',
      gap: s(12),
      marginBottom: s(12)
    },
    headerBody: { flex: 1, minWidth: 0 },
    topicTag: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(3),
      marginBottom: s(6)
    },
    topicTagText: {
      fontFamily: appFonts.body,
      fontSize: t(9),
      color: figmaColors.gray
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    body: {
      marginBottom: s(10)
    },
    engagementBar: {
      marginBottom: 0
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(10),
      marginTop: 0
    },
    emptyComments: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    commentCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(8),
      backgroundColor: figmaColors.cardFeaturedBg
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      marginBottom: s(8)
    },
    commentMore: {
      width: s(32),
      height: s(32),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: s(16)
    },
    commentMoreIcon: {
      fontFamily: appFonts.body,
      fontSize: t(22),
      lineHeight: t(22),
      color: figmaColors.gray
    },
    commentHeaderText: {
      flex: 1,
      minWidth: 0
    },
    commentAuthor: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    commentMeta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      marginTop: s(2)
    },
    commentBody: {
      marginTop: s(0)
    },
    lockedText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginTop: s(12)
    }
  });
}
