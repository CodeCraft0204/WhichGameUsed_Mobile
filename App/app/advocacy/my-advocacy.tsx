import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { advocacyCopy } from '@/constants/advocacyCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  advocacyCampaignHref,
  advocacyHref,
  safeGoBack
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  advocacyStatusLabel,
  advocacyTypeLabel,
  listMyAdvocacy,
  type AdvocacyInitiativeListItem
} from '@/lib/advocacy';

export default function AdvocacyMyAdvocacyScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [supported, setSupported] = useState<AdvocacyInitiativeListItem[]>([]);
  const [following, setFollowing] = useState<AdvocacyInitiativeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listMyAdvocacy();
    setSupported(res.supported as AdvocacyInitiativeListItem[]);
    setFollowing(res.following as AdvocacyInitiativeListItem[]);
    setError(res.error);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  function renderList(title: string, items: AdvocacyInitiativeListItem[]) {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {items.map((item) => (
          <Pressable
            key={`${title}-${item.id}`}
            style={styles.card}
            onPress={() => router.push(advocacyCampaignHref(item.id))}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {advocacyTypeLabel(item.initiative_type)} · {advocacyStatusLabel(item.status)}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProfileSubpageHeader
        title={advocacyCopy.myTitle}
        s={s}
        t={t}
        onBack={() => safeGoBack(advocacyHref())}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
          />
        }
      >
        <Text style={styles.subtitle}>{advocacyCopy.mySubtitle}</Text>
        {loading ? <Text style={styles.meta}>Loading…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && supported.length === 0 && following.length === 0 ? (
          <Text style={styles.meta}>{advocacyCopy.myEmpty}</Text>
        ) : null}
        {renderList('SUPPORTED', supported)}
        {renderList('FOLLOWING', following)}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { padding: s(20), paddingBottom: s(40) },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: '#8B2E2E',
      marginBottom: s(12)
    },
    section: { marginBottom: s(20) },
    sectionTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray,
      letterSpacing: 1,
      marginBottom: s(8)
    },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(10)
    },
    cardTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    cardMeta: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    }
  });
}
