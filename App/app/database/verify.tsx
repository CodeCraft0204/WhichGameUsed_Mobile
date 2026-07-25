import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseVerificationHref, databaseVerifyScanHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function VerifyStickerEntryScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [code, setCode] = useState('');

  function submit() {
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(databaseVerificationHref(trimmed));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ProfileSubpageHeader
          title="Verify a sticker"
          subtitle="Enter an asset ID or scan the QR on your label"
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        <Text style={styles.label}>{databaseCopy.assetId}</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="WGU-2026-000001"
          placeholderTextColor={figmaColors.gray}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
          onSubmitEditing={submit}
        />

        <AuthPrimaryButton label="Look up" onPress={submit} />

        <Pressable style={styles.secondary} onPress={() => router.push(databaseVerifyScanHref())}>
          <Text style={styles.secondaryText}>Scan QR code</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.parchment },
    content: { flex: 1, paddingHorizontal: s(20), gap: s(12) },
    label: {
      marginTop: s(8),
      fontFamily: appFonts.bodyBold,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.border,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.charcoal,
      backgroundColor: '#fff'
    },
    secondary: {
      alignItems: 'center',
      paddingVertical: s(14)
    },
    secondaryText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(16),
      color: figmaColors.charcoal,
      textDecorationLine: 'underline'
    }
  });
}
