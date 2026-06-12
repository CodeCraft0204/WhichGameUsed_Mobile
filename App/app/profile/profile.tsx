import * as ImagePicker from 'expo-image-picker';
import { appFonts } from '@/constants/appFonts';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileField } from '@/components/profile/ProfileField';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { profileCopy } from '@/constants/profileContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  displayName,
  fetchMyProfile,
  normalizeUsername,
  removeAvatar,
  updateMyProfile,
  uploadAvatarFromUri
} from '@/lib/profile';
import type { MyProfile } from '@/types/profile';

function isValidUsername(value: string): boolean {
  return /^[a-z0-9_]{3,24}$/.test(value);
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<MyProfile | null>(null);

  const [displayNameVal, setDisplayNameVal] = useState('');
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('');
  const [locationText, setLocationText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const applyProfile = useCallback((row: MyProfile) => {
    setSavedProfile(row);
    setDisplayNameVal(row.display_name ?? '');
    setUsername(row.username ?? '');
    setAbout(row.about ?? '');
    setLocationText(row.location_text ?? '');
    setAvatarUrl(row.avatar_url);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { profile, error: loadError } = await fetchMyProfile(user.id);
    if (loadError) setError(loadError);
    if (profile) applyProfile(profile);
    setLoading(false);
  }, [applyProfile, user]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const nameLabel = displayName(
    { display_name: displayNameVal, username },
    user?.email
  );

  const dirty =
    !!savedProfile &&
    (displayNameVal.trim() !== (savedProfile.display_name ?? '').trim() ||
      normalizeUsername(username) !== (savedProfile.username ?? '') ||
      about.trim() !== (savedProfile.about ?? '').trim() ||
      locationText.trim() !== (savedProfile.location_text ?? '').trim());

  const handleSave = async () => {
    if (!user || !savedProfile) return;

    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername && !isValidUsername(normalizedUsername)) {
      setError(profileCopy.validation.username);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: saveError } = await updateMyProfile(user.id, {
      display_name: displayNameVal.trim() || null,
      username: normalizedUsername || null,
      about: about.trim() || null,
      location_text: locationText.trim() || null
    });

    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }

    setSuccess(profileCopy.actions.saved);
    await refreshProfile();
    await loadProfile();
  };

  const handlePickAvatar = async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is required to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setError(null);
    setSuccess(null);

    const { url, error: uploadError } = await uploadAvatarFromUri(
      user.id,
      asset.uri,
      asset.mimeType ?? 'image/jpeg',
      asset.fileSize ?? 0
    );

    setUploading(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }

    setAvatarUrl(url);
    setSuccess('Avatar updated.');
    await refreshProfile();
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading(true);
    setError(null);
    const { error: removeError } = await removeAvatar(user.id);
    setUploading(false);
    if (removeError) {
      setError(removeError);
      return;
    }
    setAvatarUrl(null);
    setSuccess('Avatar removed.');
    await refreshProfile();
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
        title={profileCopy.title}
        subtitle={profileCopy.subtitle}
        description={profileCopy.description}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <View style={styles.heroCard}>
        <ProfileAvatar
          url={avatarUrl}
          name={nameLabel}
          size={s(112)}
          onPress={() => void handlePickAvatar()}
          disabled={uploading}
        />
        <View style={styles.heroText}>
          <Text style={styles.heroName}>{nameLabel}</Text>
          {username.trim() ? (
            <Text style={styles.heroUsername}>@{normalizeUsername(username)}</Text>
          ) : null}
          <Text style={styles.heroEmail}>{user?.email ?? ''}</Text>
        </View>
        <View style={styles.avatarActions}>
          <Pressable
            onPress={() => void handlePickAvatar()}
            disabled={uploading}
            style={styles.avatarActionBtn}
          >
            <Text style={styles.avatarActionText}>
              {uploading ? profileCopy.avatar.uploading : profileCopy.avatar.change}
            </Text>
          </Pressable>
          {avatarUrl ? (
            <Pressable
              onPress={() => void handleRemoveAvatar()}
              disabled={uploading}
              style={styles.avatarActionBtn}
            >
              <Text style={styles.avatarActionTextMuted}>{profileCopy.avatar.remove}</Text>
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => router.push('/settings/settings')}
          style={styles.settingsLink}
        >
          <Text style={styles.settingsLinkText}>{profileCopy.links.openSettings}</Text>
        </Pressable>
      </View>

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

      <ProfileSection title={profileCopy.sections.about} s={s} t={t}>
        <ProfileField
          label={profileCopy.fields.displayName}
          hint={profileCopy.fields.displayNameHint}
          icon="person"
          s={s}
          t={t}
          value={displayNameVal}
          onChangeText={setDisplayNameVal}
          autoCapitalize="words"
          maxLength={80}
        />
        <ProfileField
          label={profileCopy.fields.username}
          hint={profileCopy.fields.usernameHint}
          icon="at"
          s={s}
          t={t}
          value={username}
          onChangeText={(text) => setUsername(normalizeUsername(text))}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={24}
        />
        <ProfileField
          label={profileCopy.fields.about}
          hint={profileCopy.fields.aboutHint}
          icon="document-text"
          s={s}
          t={t}
          value={about}
          onChangeText={setAbout}
          placeholder={profileCopy.fields.aboutPlaceholder}
          multiline
          numberOfLines={4}
          style={styles.multiline}
          maxLength={500}
        />
        <ProfileField
          label={profileCopy.fields.location}
          hint={profileCopy.fields.locationHint}
          icon="location"
          s={s}
          t={t}
          value={locationText}
          onChangeText={setLocationText}
          placeholder={profileCopy.fields.locationPlaceholder}
          maxLength={120}
        />
      </ProfileSection>

      <Pressable
        onPress={() => void handleSave()}
        disabled={!dirty || saving}
        style={({ pressed }) => [
          styles.saveBtn,
          (!dirty || saving) && styles.saveBtnDisabled,
          pressed && dirty && !saving && styles.saveBtnPressed
        ]}
      >
        <Text style={styles.saveBtnText}>
          {saving ? profileCopy.actions.saving : profileCopy.actions.save}
        </Text>
      </Pressable>
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
    heroCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(20),
      alignItems: 'center',
      gap: s(14),
      marginBottom: s(18)
    },
    heroText: {
      alignItems: 'center',
      gap: s(6)
    },
    heroName: {
      fontFamily: appFonts.body,
      fontSize: t(28),
      color: figmaColors.charcoal
    },
    heroUsername: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.textSecondary
    },
    heroEmail: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.textMuted
    },
    avatarActions: {
      flexDirection: 'row',
      gap: s(20)
    },
    avatarActionBtn: {
      paddingVertical: s(4),
      paddingHorizontal: s(2)
    },
    avatarActionText: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.accentStrong
    },
    avatarActionTextMuted: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.textMuted
    },
    settingsLink: {
      marginTop: s(4),
      paddingVertical: s(6)
    },
    settingsLinkText: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    },
    multiline: {
      minHeight: s(110),
      textAlignVertical: 'top'
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
      fontFamily: appFonts.body,
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
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.success
    },
    saveBtn: {
      marginTop: s(16),
      minHeight: s(56),
      borderRadius: s(12),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 2,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20)
    },
    saveBtnPressed: {
      opacity: 0.9
    },
    saveBtnDisabled: {
      opacity: 0.45
    },
    saveBtnText: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.buttonPrimaryText,
      letterSpacing: 0.4
    }
  });
}
