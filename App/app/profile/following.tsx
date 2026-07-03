import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { SocialUserRow } from '@/components/social/SocialUserRow';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { publicProfileHref } from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listFollowing } from '@/lib/social';

export default function ProfileFollowingScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<Awaited<ReturnType<typeof listFollowing>>['items']>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { items: rows } = await listFollowing(userId);
    setItems(rows);
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={socialCopy.followingLists.followingTitle}
        s={s}
        t={t}
        onBack={() => router.back()}
      />
      {loading ? (
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>{socialCopy.followingLists.emptyFollowing}</Text>
          <Text style={styles.hint}>{socialCopy.followingLists.discoverHint}</Text>
        </View>
      ) : (
        items.map((row) => (
          <SocialUserRow
            key={row.userId}
            userId={row.userId}
            displayName={row.displayName}
            avatarUrl={row.avatarUrl}
            subtitle={new Date(row.followedAt).toLocaleDateString()}
            s={s}
            t={t}
            onPress={() => router.push(publicProfileHref(row.userId))}
          />
        ))
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    emptyWrap: { gap: s(8) },
    empty: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      lineHeight: tb(22)
    }
  });
}
