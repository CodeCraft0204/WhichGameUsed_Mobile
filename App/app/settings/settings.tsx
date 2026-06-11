import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ProfileMenuRow } from '@/components/profile/ProfileMenuRow';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { ProfileToggleRow } from '@/components/profile/ProfileToggleRow';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { settingsCopy } from '@/constants/settingsContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { fetchMyProfile, updateMyProfile } from '@/lib/profile';
function formatMemberSince(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric'
  });
}

function signInMethodLabel(provider: string | undefined): string {
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email & password';
  return 'Email';
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut, refreshProfile } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [leaderboardEligible, setLeaderboardEligible] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { profile: row, error: loadError } = await fetchMyProfile(user.id);
    if (loadError) setError(loadError);
    if (row) {
      setIsPublic(row.is_public);
      setLeaderboardEligible(row.leaderboard_eligible);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const savePrivacy = async (patch: {
    is_public?: boolean;
    leaderboard_eligible?: boolean;
  }) => {
    if (!user) return;
    setSavingPrivacy(true);
    setError(null);
    setSuccess(null);
    const { error: saveError } = await updateMyProfile(user.id, patch);
    setSavingPrivacy(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setSuccess(settingsCopy.actions.saved);
    await refreshProfile();
    await loadProfile();
  };

  const handlePublicChange = (next: boolean) => {
    setIsPublic(next);
    void savePrivacy({ is_public: next });
  };

  const handleLeaderboardChange = (next: boolean) => {
    setLeaderboardEligible(next);
    void savePrivacy({ leaderboard_eligible: next });
  };

  const handleSignOut = () => {
    const confirm = () => {
      void signOut().then(() => router.replace('/sign-in/sign-in'));
    };

    if (Platform.OS === 'web') {
      if (window.confirm(settingsCopy.actions.signOutConfirm)) confirm();
      return;
    }

    Alert.alert('Sign out', settingsCopy.actions.signOutConfirm, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: confirm }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </View>
    );
  }

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: [page.scrollContent, styles.scrollContent] }}>
      <ProfileSubpageHeader
        title={settingsCopy.title}
        subtitle={settingsCopy.subtitle}
        description={settingsCopy.description}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      {error ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>{error}</Text>
        </View>
      ) : null}
      {success ? (
        <View style={styles.bannerSuccess}>
          <Text style={styles.bannerSuccessText}>{success}</Text>
        </View>
      ) : null}

      <View style={styles.sections}>
        <ProfileSection title={settingsCopy.sections.privacy} s={s} t={t}>
          <ProfileToggleRow
            label={settingsCopy.privacy.publicProfile}
            hint={settingsCopy.privacy.publicProfileHint}
            value={isPublic}
            onValueChange={handlePublicChange}
            s={s}
            t={t}
          />
          <ProfileToggleRow
            label={settingsCopy.privacy.leaderboard}
            hint={settingsCopy.privacy.leaderboardHint}
            value={leaderboardEligible}
            onValueChange={handleLeaderboardChange}
            s={s}
            t={t}
          />
          {savingPrivacy ? (
            <Text style={styles.savingHint}>Saving preferences…</Text>
          ) : null}
        </ProfileSection>

        <ProfileSection title={settingsCopy.sections.account} s={s} t={t}>
          <ProfileMenuRow
            label={settingsCopy.account.editProfile}
            onPress={() => router.push('/profile/profile')}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.account.email}
            value={user?.email ?? ''}
            showChevron={false}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.account.memberSince}
            value={formatMemberSince(user?.created_at)}
            showChevron={false}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.account.signInMethod}
            value={signInMethodLabel(user?.app_metadata?.provider)}
            showChevron={false}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.account.changePassword}
            onPress={() => router.push('/password-reset/password-reset')}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.account.signOut}
            destructive
            onPress={handleSignOut}
            s={s}
            t={t}
          />
        </ProfileSection>

        <ProfileSection title={settingsCopy.sections.legal} s={s} t={t}>
          <ProfileMenuRow
            label={settingsCopy.legal.communityStandards}
            onPress={() => router.push('/community-standards/community-standards')}
            s={s}
            t={t}
          />
          <ProfileMenuRow
            label={settingsCopy.legal.contactSupport}
            onPress={() =>
              router.push({
                pathname: '/contact-support/contact-support',
                params: { email: user?.email ?? '' }
              })
            }
            s={s}
            t={t}
          />
        </ProfileSection>

        <ProfileSection title={settingsCopy.sections.app} s={s} t={t}>
          <ProfileMenuRow
            label={settingsCopy.app.version}
            value={settingsCopy.app.versionValue}
            showChevron={false}
            s={s}
            t={t}
          />
        </ProfileSection>
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.background
    },
    scrollContent: {
      paddingBottom: s(36)
    },
    sections: {
      gap: s(16)
    },
    savingHint: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(16),
      color: figmaColors.textMuted
    },
    bannerError: {
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      backgroundColor: figmaColors.errorBg,
      padding: s(14),
      marginBottom: s(14)
    },
    bannerErrorText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(17),
      color: figmaColors.error
    },
    bannerSuccess: {
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.infoBorder,
      backgroundColor: figmaColors.successBg,
      padding: s(14),
      marginBottom: s(14)
    },
    bannerSuccessText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(17),
      color: figmaColors.success
    }
  });
}
