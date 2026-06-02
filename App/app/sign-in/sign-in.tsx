import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { AuthOtpModal } from '@/components/auth/AuthOtpModal';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthTextLink } from '@/components/auth/AuthTextLink';
import { authCopy, authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function SignInScreen() {
  const router = useRouter();
  const { requestSignInOtp, verifySignIn, resendOtp } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.signIn;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const canSignIn = email.trim().length > 0 && password.length > 0 && !loading && !modalLoading;

  const handleSignIn = async () => {
    setError(null);
    setModalError(null);
    setLoading(true);
    const result = await requestSignInOtp(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOtp('');
    setOtpModalVisible(true);
  };

  const handleConfirmOtp = async () => {
    setModalError(null);
    setModalLoading(true);
    const result = await verifySignIn(email, otp);
    setModalLoading(false);
    if (result.error) {
      setModalError(result.error);
      return;
    }
    setOtpModalVisible(false);
    router.replace('/database/database');
  };

  const handleResend = async () => {
    setModalError(null);
    setModalLoading(true);
    const result = await resendOtp(email, false);
    setModalLoading(false);
    if (result.error) setModalError(result.error);
  };

  const handleCloseOtpModal = () => {
    setOtpModalVisible(false);
    setOtp('');
    setModalError(null);
  };

  return (
    <>
      <AuthScreen
        hero={authIcons.heroLogin}
        title={copy.title}
        subtitle={copy.subtitle}
        footerBand={
          <AuthTextLink
            prefix={copy.footerPrefix}
            linkLabel={copy.footerLink}
            onPress={() => router.push('/sign-up/sign-up')}
          />
        }
      >
        <AuthErrorBanner message={error} />

        <AuthTextField
          icon="mail"
          placeholder={copy.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          editable={!loading && !modalLoading}
        />

        <AuthTextField
          icon="lock"
          placeholder={copy.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          editable={!loading && !modalLoading}
          onSubmitEditing={() => canSignIn && void handleSignIn()}
        />

        <View style={styles.optionsRow}>
          <Link href="/password-reset/password-reset" asChild>
            <Pressable hitSlop={8} style={styles.forgotPressable} disabled={loading || modalLoading}>
              <Text style={styles.forgotText}>{copy.forgotPassword}</Text>
            </Pressable>
          </Link>
        </View>

        <AuthPrimaryButton
          label={copy.submit}
          disabled={!canSignIn}
          loading={loading}
          onPress={handleSignIn}
        />

        <AuthOrDivider label={copy.orContinue} />
        <AuthSocialButtons />
      </AuthScreen>

      <AuthOtpModal
        visible={otpModalVisible}
        title={copy.otpModalTitle}
        message={copy.otpSent}
        otpPlaceholder={copy.otpPlaceholder}
        confirmLabel={copy.confirmOtp}
        resendLabel={copy.resendCode}
        changeEmailLabel={copy.changeEmail}
        otp={otp}
        onChangeOtp={setOtp}
        onConfirm={handleConfirmOtp}
        onResend={handleResend}
        onChangeEmail={handleCloseOtpModal}
        onRequestClose={handleCloseOtpModal}
        error={modalError}
        loading={modalLoading}
      />
    </>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: s(4)
    },
    forgotPressable: {
      justifyContent: 'center'
    },
    forgotText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      lineHeight: t(24),
      color: figmaColors.accent
    }
  });
}
