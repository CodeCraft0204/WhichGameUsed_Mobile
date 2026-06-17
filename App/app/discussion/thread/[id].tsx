import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { CommentComposer } from '@/components/discussion/CommentComposer';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  createForumComment,
  getForumThread,
  reportForumContent,
  toggleForumThreadSave,
  voteForumThread,
  type ForumThreadDetail
} from '@/lib/forum';
import { useFocusEffect } from 'expo-router';

export default function DiscussionThreadScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [thread, setThread] = useState<ForumThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

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

  async function submitReply() {
    if (!id || !reply.trim()) return;
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

  async function handleVote(value: 'upvote' | 'downvote') {
    if (!id) return;
    const { error: err } = await voteForumThread(id, value);
    if (err) Alert.alert('Vote failed', err);
    else await load();
  }

  async function handleSave() {
    if (!id) return;
    const { error: err } = await toggleForumThreadSave(id);
    if (err) Alert.alert('Save failed', err);
    else await load();
  }

  function handleReport(targetType: 'forum_thread' | 'forum_comment', targetId: string) {
    Alert.alert('Report content', 'Send this to moderators for review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          void reportForumContent({
            targetType,
            targetId,
            reason: 'Reported from mobile app'
          }).then(({ error: err }) => {
            if (err) Alert.alert('Report failed', err);
            else Alert.alert('Reported', 'Thanks — our team will review this.');
          });
        }
      }
    ]);
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
          <Text style={styles.title}>{thread.title}</Text>
          <Text style={styles.meta}>
            {thread.topic_title} · by {author} · {new Date(thread.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.body}>{thread.body}</Text>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={() => void handleVote('upvote')}>
          <Text style={styles.actionText}>
            ▲ {thread.vote_score} {thread.user_vote === 'upvote' ? '· voted' : ''}
          </Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => void handleSave()}>
          <Text style={styles.actionText}>{thread.saved ? '★ Saved' : '☆ Save'}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => handleReport('forum_thread', thread.id)}>
          <Text style={styles.actionText}>Report</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>COMMENTS ({thread.comments.length})</Text>

      {thread.comments.map((comment) => {
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
            </View>
            <Text style={styles.commentBody}>{comment.body}</Text>
            <Pressable onPress={() => handleReport('forum_comment', comment.id)}>
              <Text style={styles.reportLink}>Report</Text>
            </Pressable>
          </View>
        );
      })}

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
    actionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginBottom: s(16)
    },
    actionButton: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      backgroundColor: figmaColors.tagBg
    },
    actionText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(10)
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
    reportLink: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
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
