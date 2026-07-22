import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { messageConversationHref, messagesInboxHref, safeGoBack } from '@/constants/navigation';
import { messageTopicOptions, socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { canMessageUser, startConversation, type MessageTopic } from '@/lib/social';

export default function MessageComposeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ recipientId: string; recipientName?: string }>();
  const recipientId = params.recipientId;
  const recipientName = params.recipientName ?? 'Collector';
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [topic, setTopic] = useState<MessageTopic>('general');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (!recipientId || !user) return;
    void canMessageUser(recipientId).then(({ allowed: ok }) => setAllowed(ok));
  }, [recipientId, user]);

  const send = useCallback(async () => {
    if (!recipientId || !user) return;
    if (!body.trim()) {
      setError(socialCopy.compose.bodyRequired);
      return;
    }
    setSending(true);
    setError(null);
    const { conversationId, error: sendError } = await startConversation({
      recipientId,
      topic,
      body
    });
    setSending(false);
    if (sendError || !conversationId) {
      setError(sendError ?? socialCopy.compose.notAllowed);
      return;
    }
    router.replace(messageConversationHref(conversationId));
  }, [body, recipientId, router, topic, user]);

  if (!user) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
        <ProfileSubpageHeader
          title={socialCopy.compose.title}
          s={s}
          t={t}
          onBack={() => safeGoBack(messagesInboxHref())}
        />
        <AuthPrimaryButton label="Sign in" onPress={() => router.push('/sign-in/sign-in')} />
      </FigmaScreen>
    );
  }

  if (allowed === false) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
        <ProfileSubpageHeader
          title={socialCopy.compose.title}
          subtitle={`To ${recipientName}`}
          s={s}
          t={t}
          onBack={() => safeGoBack(messagesInboxHref())}
        />
        <Text style={styles.notAllowed}>{socialCopy.compose.notAllowed}</Text>
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={socialCopy.compose.title}
        subtitle={socialCopy.compose.subtitle}
        description={`To ${recipientName}`}
        s={s}
        t={t}
        onBack={() => safeGoBack(messagesInboxHref())}
      />

      <Text style={styles.label}>{socialCopy.compose.topicLabel}</Text>
      <View style={styles.topicRow}>
        {messageTopicOptions.map((opt) => {
          const active = topic === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setTopic(opt.value)}
              style={[styles.topicChip, active && styles.topicChipActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.topicChipText, active && styles.topicChipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.topicHint}>
        {messageTopicOptions.find((opt) => opt.value === topic)?.hint}
      </Text>

      <Text style={styles.label}>{socialCopy.compose.messageLabel}</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder={socialCopy.compose.messagePlaceholder}
        placeholderTextColor={figmaColors.gray}
        multiline
        style={styles.input}
        maxLength={4000}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AuthPrimaryButton
        label={sending ? socialCopy.compose.sending : socialCopy.compose.send}
        onPress={send}
        loading={sending}
        disabled={sending}
      />
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(8)
    },
    topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginBottom: s(6) },
    topicChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      backgroundColor: figmaColors.surfaceElevated
    },
    topicChipActive: {
      borderColor: figmaColors.tabActiveBg,
      backgroundColor: figmaColors.cream
    },
    topicChipText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray
    },
    topicChipTextActive: {
      fontFamily: appFonts.bodyBold,
      color: figmaColors.charcoal
    },
    topicHint: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray,
      marginBottom: s(16),
      lineHeight: tb(20)
    },
    input: {
      minHeight: s(140),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      padding: s(14),
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.charcoal,
      textAlignVertical: 'top',
      marginBottom: s(16)
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    notAllowed: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray,
      lineHeight: tb(24)
    }
  });
}
