import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthHelpBox } from '@/components/auth/AuthHelpBox';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { authCopy, authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function PasswordResetScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.passwordReset;

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 0;

  const handleSubmit = () => {
    setSent(true);
    router.push('/set-new-password/set-new-password');
  };

  return (
    <AuthScreen
      hero={authIcons.heroReset}
      title={copy.title}
      subtitle={copy.subtitle}
      footerNote={copy.footerNote}
    >
      {sent ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{copy.success}</Text>
        </View>
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
          />

          <AuthPrimaryButton label={copy.submit} disabled={!canSubmit} onPress={handleSubmit} />

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
    successBox: {
      padding: s(16),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: '#FFFFFF'
    },
    successText: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    orRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      marginVertical: s(16)
    },
    orLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#D4D4D4'
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
