import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInfoBanner } from '@/components/auth/AuthInfoBanner';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { AuthOtpHelperRow } from '@/components/auth/AuthOtpHelperRow';
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
import { MOBILE_OTP_LENGTH } from '@/lib/mobile-auth';

type Step = 'form' | 'otp';

export default function SignUpScreen() {
  const router = useRouter();
  const { sendSignUpOtp, completeSignUp, resendOtp } = useAuth();
  const { t } = useAuthLayout();
  const labelStyles = useMemo(() => createLabelStyles(t), [t]);
  const copy = authCopy.signUp;

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSendCode =
    agreed &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordsMatch &&
    !loading;
  const canComplete = otp.trim().length >= MOBILE_OTP_LENGTH && !loading;

  const handleSendCode = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const result = await sendSignUpOtp(email, name);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setInfo(copy.otpSent);
    setStep('otp');
  };

  const handleComplete = async () => {
    setError(null);
    setLoading(true);
    const result = await completeSignUp(email, otp, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/database/database');
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    const result = await resendOtp(email, true, name);
    setLoading(false);
    if (result.error) setError(result.error);
    else setInfo(copy.otpSent);
  };

  const handleChangeEmail = () => {
    setStep('form');
    setOtp('');
    setError(null);
    setInfo(null);
  };

  return (
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
      <AuthInfoBanner message={info} />

      <AuthTextField
        icon="person"
        placeholder={copy.namePlaceholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        editable={!loading && step === 'form'}
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
        editable={!loading && step === 'form'}
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
        editable={!loading && step === 'form'}
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
        editable={!loading && step === 'form'}
      />

      {step === 'otp' ? (
        <>
          <AuthTextField
            icon="otp"
            placeholder={copy.otpPlaceholder}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={MOBILE_OTP_LENGTH}
            returnKeyType="done"
            editable={!loading}
          />
          <AuthOtpHelperRow
            resendLabel={copy.resendCode}
            changeEmailLabel={copy.changeEmail}
            onResend={handleResend}
            onChangeEmail={handleChangeEmail}
            disabled={loading}
          />
        </>
      ) : null}

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
        label={step === 'form' ? copy.sendCode : copy.submit}
        disabled={step === 'form' ? !canSendCode : !canComplete}
        loading={loading}
        onPress={step === 'form' ? handleSendCode : handleComplete}
      />

      <AuthOrDivider label={copy.orContinue} />
      <AuthSocialButtons />
    </AuthScreen>
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
