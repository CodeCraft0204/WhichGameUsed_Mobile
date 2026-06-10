import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthEmailSentCardProps = {
  email: string;
  title: string;
  body: string;
  hint?: string;
};

/** Post–OTP-send confirmation: one card with illustration, email, and next-step copy. */
export function AuthEmailSentCard({ email, title, body, hint }: AuthEmailSentCardProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const trimmedEmail = email.trim();

  return (
    <View style={styles.card} accessibilityRole="summary">
      <Image
        source={authIcons.checkMail}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityLabel="Verification email sent"
        accessibilityIgnoresInvertColors
      />

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.body}>{body}</Text>

      {/* {trimmedEmail ? (
        <View style={styles.emailPill}>
          <Text style={styles.email} numberOfLines={2} selectable>
            {trimmedEmail}
          </Text>
        </View>
      ) : null} */}

      {/* {hint ? <Text style={styles.hint}>{hint}</Text> : null} */}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      alignItems: 'center',
      paddingVertical: s(24),
      paddingHorizontal: s(20),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.ctaBackground,
      marginTop: s(64),
      marginBottom: s(16)
    },
    illustration: {
      width: s(300),
      height: s(240),
    },
    title: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(22),
      lineHeight: t(28),
      color: figmaColors.charcoal,
      textAlign: 'center',
      marginBottom: s(8)
    },
    body: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray,
      textAlign: 'center',
    },
    emailPill: {
      marginTop: s(14),
      paddingVertical: s(10),
      paddingHorizontal: s(16),
      borderRadius: s(8),
      backgroundColor: figmaColors.inputBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      maxWidth: '100%'
    },
    email: {
      fontFamily: 'Inter_500Medium',
      fontSize: t(15),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    hint: {
      marginTop: s(14),
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      textAlign: 'center',
      maxWidth: s(300)
    }
  });
}
