import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { getCardRequestById, type CardRequestRow } from '@/lib/card-requests';

function requestTitle(row: CardRequestRow): string {
  return row.card_title?.trim() || row.player_name?.trim() || row.product_name?.trim() || 'Card request';
}

export default function CardRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [request, setRequest] = useState<CardRequestRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);
    void getCardRequestById(id).then(({ request: row, error: err }) => {
      if (!active) return;
      setRequest(row);
      setError(err);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id]);

  const fields: [string, string | null | undefined][] = request
    ? [
        ['Status', request.status.replace(/_/g, ' ')],
        ['Player', request.player_name],
        ['Team', request.team_name],
        ['Product', request.product_name],
        ['Card #', request.card_number],
        ['Your notes', request.notes],
        ['Reviewer notes', request.review_notes],
        ['Submitted', new Date(request.created_at).toLocaleString()]
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.requestDetailTitle}
          subtitle={request ? requestTitle(request) : undefined}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {request ? (
          <>
            <View style={styles.card}>
              {fields.map(([label, value]) => (
                <View key={label} style={styles.row}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.value}>{value?.trim() || '—'}</Text>
                </View>
              ))}
            </View>
            {request.accepted_card_id ? (
              <AuthPrimaryButton
                label={databaseCopy.viewAcceptedCard}
                onPress={() => router.push(databaseCardHref(request.accepted_card_id!))}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(16),
      backgroundColor: figmaColors.cream
    },
    row: { marginBottom: s(12) },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal
    }
  });
}
