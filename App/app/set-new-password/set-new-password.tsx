import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthBackButton } from '@/components/auth/AuthBackButton';
import { AuthPasswordRequirements } from '@/components/auth/AuthPasswordRequirements';
import { AuthPasswordStrength } from '@/components/auth/AuthPasswordStrength';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTextField } from '@/components/auth/AuthTextField';
import {
  authCopy,
  authIcons,
  getPasswordStrength,
  passwordRequirements
} from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.setNewPassword;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const strength = getPasswordStrength(password);
  const allRulesMet = passwordRequirements.every((rule) => rule.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = allRulesMet && passwordsMatch;

  return (
    <AuthScreen
      hero={authIcons.heroSetPassword}
      title={copy.title}
      subtitle={copy.subtitle}
      headerLeading={
        <AuthBackButton label={copy.back} onPress={() => router.back()} />
      }
      footerNote={copy.footerNote}
    >
      <AuthTextField
        icon="lock"
        placeholder={copy.newPasswordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />

      <AuthPasswordStrength
        score={strength}
        label={copy.strengthLabel}
        weakLabel={copy.strengthWeak}
        strongLabel={copy.strengthStrong}
      />

      <AuthTextField
        icon="lock"
        placeholder={copy.confirmPlaceholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
      />

      <AuthPasswordRequirements password={password} title={copy.requirementsTitle} />

      <AuthPrimaryButton
        label={copy.submit}
        disabled={!canSubmit}
        onPress={() => router.replace('/sign-in/sign-in')}
      />

      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>{copy.or}</Text>
        <View style={styles.orLine} />
      </View>

      <Pressable
        style={styles.backLink}
        onPress={() => router.replace('/sign-in/sign-in')}
        accessibilityRole="link"
      >
        <Text style={styles.backLinkText}>{copy.backToSignIn}</Text>
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
      backgroundColor: '#D4D4D4'
    },
    orText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      color: figmaColors.gray
    },
    backLink: {
      alignItems: 'center',
      paddingVertical: s(8)
    },
    backLinkText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.accent
    }
  });
}
