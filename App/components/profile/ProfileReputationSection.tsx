import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import {
  detectiveRankImage,
  detectiveRankForXp,
  reputationUiImages
} from '@/constants/reputationContent';
import { requestCustomSubtitle, type ReputationProfile } from '@/lib/reputation';

export function ProfileReputationSection({
  profile,
  s,
  t,
  allowSubtitleRequest
}: {
  profile: ReputationProfile | null;
  s: (n: number) => number;
  t: (n: number) => number;
  allowSubtitleRequest?: boolean;
}) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const rank = profile
    ? detectiveRankForXp(profile.lifetimeXp)
    : detectiveRankForXp(0);
  const progress =
    profile && profile.nextRankXpMin != null && profile.nextRankXpMin > 0
      ? Math.min(1, profile.lifetimeXp / profile.nextRankXpMin)
      : profile
        ? 1
        : 0;

  const [subtitleDraft, setSubtitleDraft] = useState('');
  const [subtitleBusy, setSubtitleBusy] = useState(false);
  const [subtitleMsg, setSubtitleMsg] = useState<string | null>(null);

  const canRequestSubtitle =
    Boolean(allowSubtitleRequest) &&
    profile != null &&
    profile.rankLevel >= 5 &&
    profile.customSubtitleStatus !== 'pending';

  const submitSubtitle = useCallback(async () => {
    if (!subtitleDraft.trim() || subtitleBusy) return;
    setSubtitleBusy(true);
    setSubtitleMsg(null);
    const res = await requestCustomSubtitle(subtitleDraft.trim());
    setSubtitleBusy(false);
    if (res.error) {
      setSubtitleMsg(res.error);
      return;
    }
    setSubtitleMsg(reputationCopy.customSubtitlePending);
    setSubtitleDraft('');
  }, [subtitleBusy, subtitleDraft]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{reputationCopy.sectionTitle}</Text>
      {!profile ? (
        <Text style={styles.hint}>{reputationCopy.emptyRank}</Text>
      ) : (
        <>
          <View style={styles.rankRow}>
            <Image
              source={detectiveRankImage(profile.rankLevel)}
              style={styles.rankIcon}
              resizeMode="contain"
            />
            <View style={styles.rankText}>
              <Text style={styles.rankLabel}>{profile.rankLabel ?? rank.label}</Text>
              {profile.customSubtitle ? (
                <Text style={styles.subtitle}>“{profile.customSubtitle}”</Text>
              ) : profile.customSubtitlePending || profile.customSubtitleStatus === 'pending' ? (
                <Text style={styles.pending}>{reputationCopy.customSubtitlePending}</Text>
              ) : null}
              <Text style={styles.xp}>
                {reputationCopy.xpProgress(profile.lifetimeXp, profile.nextRankXpMin)}
              </Text>
              {profile.nextRankLabel ? (
                <Text style={styles.next}>{reputationCopy.nextRank(profile.nextRankLabel)}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={styles.donutRow}>
            <View style={styles.donutLeft}>
              <Image source={reputationUiImages.donut} style={styles.donutIcon} resizeMode="contain" />
              <Text style={styles.donutTitle}>{reputationCopy.donutsTitle}</Text>
            </View>
            <Text style={styles.donutBal}>{profile.donutsBalance}</Text>
          </View>
          <Text style={styles.hint}>{reputationCopy.donutsHint}</Text>
          <Text style={styles.hint}>{reputationCopy.monthlyVsLifetime}</Text>
          {canRequestSubtitle ? (
            <View style={styles.subtitleForm}>
              <Text style={styles.donutTitle}>{reputationCopy.requestSubtitleTitle}</Text>
              <TextInput
                value={subtitleDraft}
                onChangeText={setSubtitleDraft}
                placeholder={reputationCopy.requestSubtitlePlaceholder}
                placeholderTextColor={figmaColors.gray}
                maxLength={48}
                style={styles.subtitleInput}
              />
              <Pressable
                onPress={() => void submitSubtitle()}
                disabled={subtitleBusy || !subtitleDraft.trim()}
                style={[styles.subtitleBtn, (!subtitleDraft.trim() || subtitleBusy) && styles.disabled]}
              >
                <Text style={styles.subtitleBtnText}>
                  {subtitleBusy ? reputationCopy.requestSubtitleBusy : reputationCopy.requestSubtitleCta}
                </Text>
              </Pressable>
              {subtitleMsg ? <Text style={styles.pending}>{subtitleMsg}</Text> : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    section: {
      width: '100%',
      marginTop: s(2),
      marginBottom: s(16),
      gap: s(8),
      paddingVertical: s(12),
      paddingHorizontal: s(10),
      borderRadius: s(14),
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.8,
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.textMuted,
      lineHeight: t(15)
    },
    rankRow: { flexDirection: 'row', gap: s(10), alignItems: 'center' },
    rankIcon: { width: s(64), height: s(64) },
    rankText: { flex: 1, gap: s(2) },
    rankLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(16),
      color: figmaColors.ink
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.brown,
      fontStyle: 'italic'
    },
    pending: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.brownMuted
    },
    xp: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.charcoal
    },
    next: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray
    },
    barTrack: {
      height: s(8),
      borderRadius: s(4),
      backgroundColor: figmaColors.surfaceMuted,
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      backgroundColor: figmaColors.bronze
    },
    donutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: s(4)
    },
    donutLeft: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
    donutIcon: { width: s(28), height: s(28) },
    donutTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    donutBal: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(18),
      color: figmaColors.ink
    },
    subtitleForm: { gap: s(6), marginTop: s(4) },
    subtitleInput: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(8),
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.ink,
      backgroundColor: figmaColors.cream
    },
    subtitleBtn: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tabActiveBg,
      borderRadius: s(8),
      paddingHorizontal: s(12),
      paddingVertical: s(8)
    },
    subtitleBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    disabled: { opacity: 0.5 }
  });
}
