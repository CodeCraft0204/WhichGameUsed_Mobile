import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInfoBanner } from '@/components/auth/AuthInfoBanner';
import { AuthOtpHelperRow } from '@/components/auth/AuthOtpHelperRow';
import { AuthOtpInput } from '@/components/auth/AuthOtpInput';
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
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { MOBILE_OTP_LENGTH } from '@/lib/mobile-auth';

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const { completeSetNewPassword, sendPasswordOtp, resendOtp } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.setNewPassword;

  const [email, setEmail] = useState(typeof params.email === 'string' ? params.email : '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);
  const allRulesMet = passwordRequirements.every((rule) => rule.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    email.trim().length > 0 &&
    otp.trim().length >= MOBILE_OTP_LENGTH &&
    allRulesMet &&
    passwordsMatch &&
    !loading;

  const handleUpdate = async () => {
    setError(null);
    setLoading(true);
    const result = await completeSetNewPassword(email, otp, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (!result.requiresReauth) {
      return;
    }

    setInfo(copy.successRedirecting);
    router.replace({
      pathname: '/sign-in/sign-in',
      params: { email: email.trim(), reauth: 'password-reset' }
    });
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    const result = await sendPasswordOtp(email);
    setLoading(false);
    if (result.error) setError(result.error);
    else setInfo(authCopy.passwordReset.codeResent);
  };

  return (
    <AuthScreen
      hero={authIcons.heroSetPassword}
      title={copy.title}
      subtitle={copy.subtitle}
      footerNote={copy.footerNote}
    >
      <AuthErrorBanner message={error} />
      <AuthInfoBanner message={info} />

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

      <AuthOtpInput value={otp} onChangeValue={setOtp} editable={!loading} autoFocus />

      <AuthOtpHelperRow
        resendLabel={copy.resendCode}
        changeEmailLabel="Edit email"
        onResend={handleResend}
        onChangeEmail={() => router.replace('/password-reset/password-reset')}
        disabled={loading}
      />

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
        editable={!loading}
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
        editable={!loading}
      />

      <AuthPasswordRequirements password={password} title={copy.requirementsTitle} />

      <AuthPrimaryButton
        label={copy.submit}
        disabled={!canSubmit}
        loading={loading}
        onPress={handleUpdate}
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
