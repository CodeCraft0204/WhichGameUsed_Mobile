import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { AuthOtpModal } from '@/components/auth/AuthOtpModal';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthTextLink } from '@/components/auth/AuthTextLink';
import { authCopy, authIcons } from '@/constants/authContent';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useAuthLayout } from '@/hooks/useAuthLayout';

export default function SignUpScreen() {
  const router = useRouter();
  const { sendSignUpOtp, completeSignUp, resendOtp } = useAuth();
  const { t } = useAuthLayout();
  const labelStyles = useMemo(() => createLabelStyles(t), [t]);
  const copy = authCopy.signUp;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSendCode =
    agreed &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordsMatch &&
    !loading &&
    !modalLoading;

  const handleSendCode = async () => {
    setError(null);
    setModalError(null);
    setLoading(true);
    const result = await sendSignUpOtp(email, name);
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
    const result = await completeSignUp(email, otp, password, name);
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
    const result = await resendOtp(email, true, name);
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
        hero={authIcons.heroSignup}
        title={copy.title}
        subtitle={copy.subtitle}
        footerBand={
          <AuthTextLink
            prefix={copy.footerPrefix}
            linkLabel={copy.footerLink}
            onPress={() => router.replace('/sign-in/sign-in')}
          />
        }
      >
        <AuthErrorBanner message={error} />

        <AuthTextField
          icon="person"
          placeholder={copy.namePlaceholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          editable={!loading && !modalLoading}
        />

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
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          editable={!loading && !modalLoading}
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
          editable={!loading && !modalLoading}
        />

        <AuthCheckbox
          checked={agreed}
          onToggle={() => setAgreed((v) => !v)}
          label={
            <Text style={labelStyles.agreeText}>
              {copy.agreePrefix}
              <Text style={labelStyles.agreeLink}>{copy.communityStandards}</Text>
            </Text>
          }
        />

        <AuthPrimaryButton
          label={copy.sendCode}
          disabled={!canSendCode}
          loading={loading}
          onPress={handleSendCode}
        />

        <AuthOrDivider label={copy.orContinue} />
        <AuthSocialButtons />
      </AuthScreen>

      <AuthOtpModal
        visible={otpModalVisible}
        title={copy.otpModalTitle}
        message={copy.otpSent}
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

function createLabelStyles(t: (n: number) => number) {
  const fontSize = t(authLayout.fieldFontSize);
  const lineHeight = t(24);

  return StyleSheet.create({
    agreeText: {
      fontFamily: 'Inter_400Regular',
      fontSize,
      lineHeight,
      color: figmaColors.gray
    },
    agreeLink: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize,
      lineHeight,
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    }
  });
}
