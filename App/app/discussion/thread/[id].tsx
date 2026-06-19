import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CommentComposer } from '@/components/discussion/CommentComposer';
import { DiscussionMoreSheet } from '@/components/discussion/DiscussionMoreSheet';
import {
  ReportContentSheet,
  type ReportSheetTarget
} from '@/components/discussion/ReportContentSheet';
import { ThreadEngagementBar } from '@/components/discussion/ThreadEngagementBar';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import {
  forumReportReasonLabel,
  type ForumReportReasonKey
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useThreadClaps } from '@/hooks/useThreadClaps';
import {
  createForumComment,
  getForumThread,
  hideForumThreadLess,
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
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportBusy, setReportBusy] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

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

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { thread: data, error: err } = await getForumThread(id);
    if (err) setError(err);
    else setThread(data);
    setLoading(false);
  }, [id]);

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
    await load();
  }

  async function handleSave() {
    if (!id) return;
    requireSignedIn(() => {
      void (async () => {
        const { error: err } = await toggleForumThreadSave(id);
        if (err) Alert.alert('Save failed', err);
        else await load();
      })();
    });
  }

  function handleClapPressIn() {
    requireSignedIn(() => claps.onPressIn());
  }

  function handleVote(value: 'upvote' | 'downvote') {
    if (!id) return;
    requireSignedIn(() => {
      void (async () => {
        const { error: err, user_vote, vote_score } = await voteForumThread(id, value);
        if (err) {
          Alert.alert('Vote failed', err);
          return;
        }
        setThread((prev) =>
          prev
            ? {
                ...prev,
                user_vote: user_vote ?? null,
                vote_score: vote_score ?? prev.vote_score
              }
            : prev
        );
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
                Alert.alert('Feed updated', 'You will see less content like this.');
                router.back();
              })();
            }
          }
        ]
      );
    });
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
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={loading} onRefresh={() => void load()} />
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.threadHeader}>
        <ProfileAvatar url={thread.author_avatar_url} name={author} size={s(56)} />
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

      <Text style={styles.body}>{thread.body}</Text>

      <ThreadEngagementBar
        voteScore={thread.vote_score}
        userVote={thread.user_vote}
        onUpvote={() => handleVote('upvote')}
        onDownvote={() => handleVote('downvote')}
        totalClaps={claps.displayTotal}
        userClaps={claps.displayUser}
        clapMaxed={claps.maxed}
        clapBubbles={claps.bubbles}
        onClapPressIn={handleClapPressIn}
        onClapPressOut={claps.onPressOut}
        saved={Boolean(thread.saved)}
        onSave={() => void handleSave()}
        onMore={openMoreMenu}
        disabled={busy || claps.syncing}
        s={s}
        t={t}
      />

      <Text style={styles.sectionTitle}>COMMENTS ({thread.comments.length})</Text>

      {thread.comments.length === 0 ? (
        <Text style={styles.emptyComments}>No replies yet — add the first comment below.</Text>
      ) : (
        thread.comments.map((comment) => {
          const commentAuthor =
            comment.author_display_name || comment.author_username || 'Collector';
          return (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <ProfileAvatar
                  url={comment.author_avatar_url}
                  name={commentAuthor}
                  size={s(40)}
                />
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
              <Text style={styles.commentBody}>{comment.body}</Text>
            </View>
          );
        })
      )}

      {thread.is_locked ? (
        <Text style={styles.lockedText}>This thread is locked — new replies are disabled.</Text>
      ) : (
        <CommentComposer
          value={reply}
          onChangeText={setReply}
          onSubmit={() => void submitReply()}
          busy={busy}
          s={s}
          t={t}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <DiscussionMoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onShowLess={() => {
          setMoreOpen(false);
          handleShowLess();
        }}
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
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      marginBottom: s(12)
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(10)
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
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    lockedText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginTop: s(12)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginTop: s(12)
    }
  });
}
