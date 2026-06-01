import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text } from 'react-native';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthTextLink } from '@/components/auth/AuthTextLink';
import { authCopy, authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';

export default function SignUpScreen() {
  const router = useRouter();
  const copy = authCopy.signUp;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    agreed &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8 &&
    passwordsMatch;

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
      <AuthTextField
        icon="person"
        placeholder={copy.namePlaceholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
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

      <AuthCheckbox
        checked={agreed}
        onToggle={() => setAgreed((v) => !v)}
        label={
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: figmaColors.gray }}>
            {copy.agreePrefix}
            <Text style={{ color: figmaColors.accent, fontFamily: 'EBGaramond_700Bold' }}>
              {copy.communityStandards}
            </Text>
          </Text>
        }
      />

      <AuthPrimaryButton
        label={copy.submit}
        disabled={!canSubmit}
        onPress={() => router.replace('/database/database')}
      />

      <AuthOrDivider label={copy.orContinue} />
      <AuthSocialButtons />
    </AuthScreen>
  );
}
