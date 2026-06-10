import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthEmailSentCard } from '@/components/auth/AuthEmailSentCard';
import { AuthHelpBox } from '@/components/auth/AuthHelpBox';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { authCopy, authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function PasswordResetScreen() {
  const router = useRouter();
  const { sendPasswordOtp } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.passwordReset;

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && !loading;

  const handleSendCode = async () => {
    setError(null);
    setLoading(true);
    const result = await sendPasswordOtp(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  };

  const goToSetPassword = () => {
    router.push({
      pathname: '/set-new-password/set-new-password',
      params: { email: email.trim() }
    });
  };

  return (
    <AuthScreen
      hero={authIcons.heroReset}
      title={copy.title}
      subtitle={sent ? undefined : copy.subtitle}
      footerNote={copy.footerNote}
    >
      <AuthErrorBanner message={error} />

      {sent ? (
        <>
          <AuthEmailSentCard
            email={email}
            title={copy.codeSentTitle}
            body={copy.codeSentBody}
            hint={copy.codeSentHint}
          />
          <AuthPrimaryButton
            label={copy.continueToSetPassword}
            disabled={loading}
            onPress={goToSetPassword}
          />
        </>
      ) : (
        <>
          <AuthTextField
            icon="mail"
            placeholder={copy.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            editable={!loading}
          />

          <AuthPrimaryButton
            label={copy.submit}
            disabled={!canSubmit}
            loading={loading}
            onPress={handleSendCode}
          />

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>{copy.or}</Text>
            <View style={styles.orLine} />
          </View>

          <AuthHelpBox
            title={copy.helpTitle}
            body={copy.helpBody}
            linkPrefix={copy.helpLinkPrefix}
            linkLabel={copy.helpLink}
            onLinkPress={() =>
              router.push({
                pathname: '/contact-support/contact-support',
                params: email.trim() ? { email: email.trim() } : {}
              })
            }
          />
        </>
      )}

      <Pressable
        style={styles.backRow}
        onPress={() => router.replace('/sign-in/sign-in')}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={s(18)} color={figmaColors.accent} />
        <Text style={styles.backText}>{copy.backToSignIn}</Text>
      </Pressable>
    </AuthScreen>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    orRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      marginVertical: s(16)
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: figmaColors.borderLight
    },
    orText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      color: figmaColors.gray
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(20)
    },
    backText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.accent
    }
  });
}
