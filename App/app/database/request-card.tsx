import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { createCardRequest } from '@/lib/card-requests';

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontFamily: 'Inter_700Bold',
          fontSize: 12,
          color: figmaColors.gray,
          marginBottom: 6
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={figmaColors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          borderWidth: 1,
          borderColor: figmaColors.borderLight,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 10,
          fontFamily: 'Inter_400Regular',
          fontSize: 16,
          color: figmaColors.charcoal,
          backgroundColor: figmaColors.cream,
          minHeight: multiline ? 88 : undefined
        }}
      />
    </View>
  );
}

export default function RequestCardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string; returnTo?: string }>();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const initialQuery = typeof params.query === 'string' ? params.query : '';
  const [playerName, setPlayerName] = useState(initialQuery);
  const [teamName, setTeamName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [productYear, setProductYear] = useState('');
  const [productName, setProductName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [memorabiliaType, setMemorabiliaType] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      router.replace('/sign-in/sign-in');
      return;
    }
    setError(null);
    setLoading(true);
    const year = productYear.trim() ? Number.parseInt(productYear, 10) : null;
    const { error: submitError } = await createCardRequest(user.id, {
      player_name: playerName,
      team_name: teamName,
      manufacturer_name: manufacturer,
      product_year: Number.isFinite(year) ? year : null,
      product_name: productName,
      card_number: cardNumber,
      card_title: cardTitle || playerName || productName,
      memorabilia_type: memorabiliaType,
      notes
    });
    setLoading(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    setDone(true);
  };

  const goBack = () => {
    if (params.returnTo === 'camera') {
      router.replace('/camera/card-search');
      return;
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProfileSubpageHeader
          title={databaseCopy.requestCardTitle}
          subtitle={databaseCopy.requestCardSubtitle}
          s={s}
          t={t}
          onBack={goBack}
        />

        {!user ? (
          <View style={styles.signInCard}>
            <Text style={styles.signInText}>{databaseCopy.requestSignIn}</Text>
            <AuthPrimaryButton label="SIGN IN" onPress={() => router.replace('/sign-in/sign-in')} />
          </View>
        ) : done ? (
          <View style={styles.successCard}>
            <Text style={styles.successText}>{databaseCopy.requestSuccess}</Text>
            <AuthPrimaryButton label="DONE" onPress={goBack} />
          </View>
        ) : (
          <>
            <Field label={databaseCopy.player} value={playerName} onChangeText={setPlayerName} />
            <Field label={databaseCopy.team} value={teamName} onChangeText={setTeamName} />
            <Field label={databaseCopy.manufacturer} value={manufacturer} onChangeText={setManufacturer} />
            <Field
              label={databaseCopy.year}
              value={productYear}
              onChangeText={setProductYear}
              keyboardType="numeric"
            />
            <Field label={databaseCopy.product} value={productName} onChangeText={setProductName} />
            <Field label={databaseCopy.cardNumber} value={cardNumber} onChangeText={setCardNumber} />
            <Field label="Card title" value={cardTitle} onChangeText={setCardTitle} placeholder="Optional display title" />
            <Field label={databaseCopy.memorabilia} value={memorabiliaType} onChangeText={setMemorabiliaType} />
            <Field
              label={databaseCopy.yourNotes}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Anything else that helps us identify this card"
            />
            {error ? <AuthErrorBanner message={error} /> : null}
            <AuthPrimaryButton
              label={loading ? 'SUBMITTING…' : databaseCopy.requestSubmit}
              onPress={() => void handleSubmit()}
              disabled={loading}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    signInCard: { gap: s(16), marginTop: s(8) },
    signInText: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(18),
      color: figmaColors.gray
    },
    successCard: { gap: s(16), marginTop: s(8) },
    successText: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(18),
      lineHeight: t(26),
      color: figmaColors.charcoal
    }
  });
}
