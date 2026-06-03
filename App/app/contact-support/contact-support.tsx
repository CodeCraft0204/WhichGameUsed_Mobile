import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthSubpageShell } from '@/components/auth/AuthSubpageShell';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { legalCopy } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { SUPPORT_EMAIL, SUPPORT_RESPONSE_HINT } from '@/constants/support';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type SupportTopicId = (typeof legalCopy.contactSupport.topics)[number]['id'];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ContactSupportScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = typeof params.email === 'string' ? params.email : '';
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = legalCopy.contactSupport;

  const [topic, setTopic] = useState<SupportTopicId | null>(null);
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    topic !== null &&
    isValidEmail(email) &&
    message.trim().length >= 10 &&
    !loading;

  const handleSubmit = async () => {
    setError(null);

    if (!topic) {
      setError(copy.validationTopic);
      return;
    }
    if (!isValidEmail(email)) {
      setError(copy.validationEmail);
      return;
    }
    if (message.trim().length < 10) {
      setError(copy.validationMessage);
      return;
    }

    const topicLabel = copy.topics.find((item) => item.id === topic)?.label ?? topic;
    const subject = encodeURIComponent(`Which Game Used — ${topicLabel}`);
    const body = encodeURIComponent(
      `Topic: ${topicLabel}\nEmail: ${email.trim()}\n\n${message.trim()}`
    );
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setLoading(true);
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (!supported) {
        setError(copy.mailUnavailable);
        return;
      }
      await Linking.openURL(mailto);
    } catch {
      setError(copy.mailUnavailable);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectEmail = () => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <AuthSubpageShell title={copy.title} subtitle={copy.subtitle}>
      <AuthErrorBanner message={error} />

      <View style={styles.infoCard}>
        <Ionicons name="time-outline" size={s(20)} color={figmaColors.accent} />
        <Text style={styles.infoText}>{SUPPORT_RESPONSE_HINT}</Text>
      </View>

      <Text style={styles.fieldLabel}>{copy.topicLabel}</Text>
      <View style={styles.chipRow}>
        {copy.topics.map((item) => {
          const selected = topic === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTopic(item.id)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>{copy.emailLabel}</Text>
      <AuthTextField
        icon="mail"
        placeholder={copy.emailPlaceholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        editable={!loading}
      />

      <Text style={styles.fieldLabel}>{copy.messageLabel}</Text>
      <TextInput
        style={styles.messageInput}
        placeholder={copy.messagePlaceholder}
        placeholderTextColor="#9A9A9A"
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
        editable={!loading}
      />

      <AuthPrimaryButton
        label={copy.submit}
        disabled={!canSubmit}
        loading={loading}
        onPress={handleSubmit}
      />

      {/* <Pressable
        style={styles.directEmailRow}
        onPress={handleDirectEmail}
        accessibilityRole="button"
      >
        <Ionicons name="mail-outline" size={s(18)} color={figmaColors.accent} />
        <View style={styles.directEmailText}>
          <Text style={styles.directEmailLabel}>{copy.emailUs}</Text>
          <Text style={styles.directEmailValue}>{SUPPORT_EMAIL}</Text>
        </View>
      </Pressable> */}
    </AuthSubpageShell>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      padding: s(14),
      borderRadius: s(10),
      backgroundColor: figmaColors.ctaBackground,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    infoText: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    },
    fieldLabel: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      marginTop: s(4)
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8)
    },
    chip: {
      paddingVertical: s(8),
      paddingHorizontal: s(12),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: '#FFFFFF'
    },
    chipSelected: {
      borderColor: figmaColors.charcoal,
      backgroundColor: figmaColors.charcoal
    },
    chipText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      color: figmaColors.gray
    },
    chipTextSelected: {
      color: figmaColors.cream,
      fontFamily: 'Inter_700Bold'
    },
    messageInput: {
      minHeight: s(120),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: '#D4D4D4',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: 'Inter_400Regular',
      fontSize: t(15),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    directEmailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      marginTop: s(8),
      paddingVertical: s(12)
    },
    directEmailText: {
      flex: 1,
      gap: s(2)
    },
    directEmailLabel: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    directEmailValue: {
      fontFamily: 'Inter_500Medium',
      fontSize: t(15),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    }
  });
}
