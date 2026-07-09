import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaColors } from '@/constants/figmaColors';
import { forumUserTextStyle } from '@/constants/discussionContent';
import { discussionThreadHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { createForumThread, listForumTopics } from '@/lib/forum';

export default function DiscussionCreateScreen() {
  const router = useRouter();
  const { topicSlug, initialTitle, initialBody } = useLocalSearchParams<{
    topicSlug?: string;
    initialTitle?: string;
    initialBody?: string;
  }>();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [topics, setTopics] = useState<Awaited<ReturnType<typeof listForumTopics>>['items']>([]);
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState(initialTitle ?? '');
  const [body, setBody] = useState(initialBody ?? '');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadTopics = useCallback(async () => {
    setLoading(true);
    const { items, error } = await listForumTopics();
    if (error) Alert.alert('Could not load topics', error);
    setTopics(items.filter((topic) => !topic.is_locked));
    if (topicSlug) {
      const match = items.find((topic) => topic.slug === topicSlug);
      if (match) setTopicId(match.id);
    } else if (items[0]) {
      setTopicId(items[0].id);
    }
    setLoading(false);
  }, [topicSlug]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  async function submit() {
    if (!topicId || !title.trim() || !body.trim()) {
      Alert.alert('Missing fields', 'Choose a topic, title, and body.');
      return;
    }
    setBusy(true);
    const { threadId, error } = await createForumThread({
      topicId,
      title: title.trim(),
      body: body.trim()
    });
    setBusy(false);
    if (error) {
      Alert.alert('Could not create thread', error);
      return;
    }
    if (threadId) router.replace(discussionThreadHref(threadId));
  }

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Cancel</Text>
      </Pressable>

      <Text style={styles.heading}>START A THREAD</Text>

      {loading ? (
        <ActivityIndicator color={figmaColors.charcoal} />
      ) : (
        <>
          <Text style={styles.label}>Topic</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicRow}>
            {topics.map((topic) => {
              const active = topic.id === topicId;
              return (
                <Pressable
                  key={topic.id}
                  style={[styles.topicChip, active && styles.topicChipActive]}
                  onPress={() => setTopicId(topic.id)}
                >
                  <Text style={[styles.topicChipText, active && styles.topicChipTextActive]}>
                    {topic.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to discuss?"
            placeholderTextColor={figmaColors.textMuted}
          />

          <Text style={styles.label}>Body</Text>
          <TextInput
            style={[styles.input, styles.bodyInput]}
            value={body}
            onChangeText={setBody}
            placeholder="Share evidence, questions, or context…"
            placeholderTextColor={figmaColors.textMuted}
            multiline
          />

          <Pressable
            style={[styles.submitButton, busy && styles.submitDisabled]}
            onPress={() => void submit()}
            disabled={busy}
          >
            <Text style={styles.submitText}>{busy ? 'POSTING…' : 'POST THREAD'}</Text>
          </Pressable>
        </>
      )}
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
    heading: {
      fontFamily: appFonts.display,
      fontSize: t(28),
      color: figmaColors.charcoal,
      marginBottom: s(16)
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    topicRow: {
      marginBottom: s(16)
    },
    topicChip: {
      minHeight: s(40),
      paddingHorizontal: s(16),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.tabInactiveBorder,
      backgroundColor: figmaColors.tabInactiveBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: s(10)
    },
    topicChipActive: {
      backgroundColor: figmaColors.tabActiveBg,
      borderColor: figmaColors.tabActiveBorder
    },
    topicChipText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.tabText
    },
    topicChipTextActive: {
      color: figmaColors.tabTextActive
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      marginBottom: s(14),
      backgroundColor: figmaColors.background
    },
    bodyInput: {
      minHeight: s(160),
      textAlignVertical: 'top',
      ...forumUserTextStyle(t, 15, 22)
    },
    submitButton: {
      height: s(44),
      borderRadius: s(22),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    submitDisabled: { opacity: 0.6 },
    submitText: {
      fontFamily: appFonts.accent,
      fontSize: t(14),
      color: figmaColors.buttonPrimaryText
    }
  });
}
