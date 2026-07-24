import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthSubpageShell } from '@/components/auth/AuthSubpageShell';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { legalCopy } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { SUPPORT_RESPONSE_HINT } from '@/constants/support';
import { useAuthLayout } from '@/hooks/useAuthLayout';
import { absolutePortalUrl } from '@/lib/portal-url';
import { submitSupportTicket, type SupportTopicId } from '@/lib/support-tickets';

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
  const [publicRef, setPublicRef] = useState<string | null>(null);

  const canSubmit =
    topic !== null &&
    isValidEmail(email) &&
    message.trim().length >= 10 &&
    !loading;

  const statusUrl = publicRef
    ? absolutePortalUrl(`/support/status?ref=${encodeURIComponent(publicRef)}`)
    : null;

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

    setLoading(true);
    const result = await submitSupportTicket({
      email,
      topic,
      message,
      source: 'mobile'
    });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setPublicRef(result.publicRef);
  };

  const handleSendAnother = () => {
    setPublicRef(null);
    setTopic(null);
    setMessage('');
    setError(null);
  };

  if (publicRef) {
    return (
      <AuthSubpageShell title={copy.successTitle} subtitle={copy.successBody}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={s(36)} color={figmaColors.accent} />
          <Text style={styles.successHint}>{SUPPORT_RESPONSE_HINT}</Text>
          <Text style={styles.referenceLabel}>{copy.successReference}</Text>
          <Text style={styles.referenceValue} selectable>
            {publicRef}
          </Text>
          <Text style={styles.statusHint}>{copy.successStatusHint}</Text>
        </View>
        {statusUrl ? (
          <AuthPrimaryButton
            label={copy.viewStatus}
            onPress={() => {
              void Linking.openURL(statusUrl);
            }}
          />
        ) : null}
        <Pressable
          style={styles.secondaryAction}
          onPress={handleSendAnother}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryActionText}>{copy.sendAnother}</Text>
        </Pressable>
      </AuthSubpageShell>
    );
  }

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
        placeholderTextColor={figmaColors.textMuted}
        value={message}
        onChangeText={setMessage}
        multiline
        textAlignVertical="top"
        editable={!loading}
        maxLength={5000}
      />

      <AuthPrimaryButton
        label={copy.submit}
        disabled={!canSubmit}
        loading={loading}
        onPress={handleSubmit}
      />
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
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    },
    fieldLabel: {
      fontFamily: appFonts.body,
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
      backgroundColor: figmaColors.inputBg
    },
    chipSelected: {
      borderColor: figmaColors.charcoal,
      backgroundColor: figmaColors.charcoal
    },
    chipText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    chipTextSelected: {
      color: figmaColors.cream,
      fontFamily: appFonts.body
    },
    messageInput: {
      minHeight: s(120),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      backgroundColor: figmaColors.inputBg,
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    successCard: {
      alignItems: 'center',
      gap: s(10),
      padding: s(20),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.inputBg
    },
    successHint: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    referenceLabel: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    referenceValue: {
      fontFamily: appFonts.body,
      fontSize: t(22),
      letterSpacing: 1,
      color: figmaColors.charcoal
    },
    statusHint: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    secondaryAction: {
      alignItems: 'center',
      paddingVertical: s(14)
    },
    secondaryActionText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    }
  });
}
