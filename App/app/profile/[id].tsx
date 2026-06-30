/**
 * Public read-only profile for another user.
 * Reached by tapping a leaderboard entry.
 * Respects profiles.is_public — private profiles show a placeholder.
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { fetchPublicProfile } from '@/lib/leaderboard';
import type { PublicProfile } from '@/lib/leaderboard';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const { profile: p, error: e } = await fetchPublicProfile(id);
    setProfile(p);
    setError(e);
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: [page.scrollContent, styles.centred] }}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </FigmaScreen>
    );
  }

  // Private or not found
  if (!profile) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
        <ProfileSubpageHeader
          title="PROFILE"
          s={s}
          t={t}
          onBack={() => router.back()}
        />
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Private Profile</Text>
          <Text style={styles.placeholderBody}>
            {error ?? 'This user has set their profile to private.'}
          </Text>
        </View>
      </FigmaScreen>
    );
  }

  const nameLabel = profile.displayName;
  const usernameLabel = profile.username ? `@${profile.username}` : null;

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={nameLabel.toUpperCase()}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <View style={styles.heroCard}>
        <ProfileAvatar url={profile.avatarUrl} name={nameLabel} size={s(280)} />
        <View style={styles.heroText}>
          <Text style={styles.heroName}>{nameLabel}</Text>
          {usernameLabel ? <Text style={styles.heroUsername}>{usernameLabel}</Text> : null}
        </View>
      </View>

      {profile.about ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <Text style={styles.sectionBody}>{profile.about}</Text>
        </View>
      ) : null}

      {profile.locationText ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION</Text>
          <Text style={styles.sectionBody}>{profile.locationText}</Text>
        </View>
      ) : null}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    centred: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(20),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(16),
      marginBottom: s(20)
    },
    heroText: {
      flex: 1,
      gap: s(6)
    },
    heroName: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      lineHeight: t(32),
      color: figmaColors.charcoal
    },
    heroUsername: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    section: {
      marginBottom: s(16)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: s(6)
    },
    sectionBody: {
      fontFamily: appFonts.body,
      fontSize: tb(19),
      lineHeight: tb(26),
      color: figmaColors.charcoal
    },
    placeholder: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(20),
      gap: s(8)
    },
    placeholderTitle: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal
    },
    placeholderBody: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      lineHeight: tb(24),
      color: figmaColors.gray
    }
  });
}
