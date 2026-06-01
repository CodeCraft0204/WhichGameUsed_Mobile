import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthOrDivider } from '@/components/auth/AuthOrDivider';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { AuthTextLink } from '@/components/auth/AuthTextLink';
import { authCopy, authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function SignInScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const copy = authCopy.signIn;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
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
        autoComplete="password"
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => canSubmit && router.replace('/database/database')}
      />

      <View style={styles.optionsRow}>
        <AuthCheckbox
          checked={rememberMe}
          onToggle={() => setRememberMe((v) => !v)}
          label={copy.rememberMe}
        />
        <Link href="/password-reset/password-reset" asChild>
          <Pressable hitSlop={8}>
            <Text style={styles.forgotText}>{copy.forgotPassword}</Text>
          </Pressable>
        </Link>
      </View>

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

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: s(4),
      gap: s(8)
    },
    forgotText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(14),
      lineHeight: t(18),
      color: figmaColors.accent
    }
  });
}
