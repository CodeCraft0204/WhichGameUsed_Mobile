/**
 * Public collector profile — reached from leaderboard tap-through.
 * Shows rank, points breakdown, and recent point history.
 */
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfilePointHistory } from '@/components/profile/ProfilePointHistory';
import { ProfilePointsBreakdown } from '@/components/profile/ProfilePointsBreakdown';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { LEADERBOARD_EVENT_GROUPS } from '@/constants/leaderboardEventLabels';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import {
  buildPointBreakdown,
  fetchPublicProfile,
  formatPoints,
  getUserStanding,
  listUserPointEvents,
  type LeaderboardPeriod,
  type PointEvent,
  type PublicProfile
} from '@/lib/leaderboard';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

function parsePeriod(raw: string | string[] | undefined): LeaderboardPeriod {
  if (raw === 'all_time' || raw === 'month') return raw;
  return 'month';
}

function parseOptionalInt(raw: string | string[] | undefined): number | null {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{
    id: string;
    rank?: string;
    points?: string;
    period?: string;
  }>();
  const { id, rank: rankParam, points: pointsParam, period: periodParam } = params;
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const period = parsePeriod(periodParam);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rank, setRank] = useState<number | null>(parseOptionalInt(rankParam));
  const [points, setPoints] = useState<number | null>(parseOptionalInt(pointsParam));
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState<PointEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id) return;
    if (!opts?.silent) setLoading(true);
    setError(null);

    const [profileRes, standingRes, eventsRes] = await Promise.all([
      fetchPublicProfile(id),
      getUserStanding(id, period),
      listUserPointEvents(id, { period, limit: 200 })
    ]);

    setProfile(profileRes.profile);
    setError(profileRes.error);

    if (standingRes.entry) {
      setRank(standingRes.entry.rank);
      setPoints(standingRes.entry.points);
      setEventCount(standingRes.entry.eventCount);
    }

    setEvents(eventsRes.items);
    setLoading(false);
  }, [id, period]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useLeaderboardRealtime(() => { void load({ silent: true }); }, !!id);

  const breakdown = useMemo(
    () => buildPointBreakdown(events, LEADERBOARD_EVENT_GROUPS),
    [events]
  );

  if (loading && !profile) {
    return (
      <FigmaScreen scrollProps={{ contentContainerStyle: [page.scrollContent, styles.centred] }}>
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      </FigmaScreen>
    );
  }

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
          <Text style={styles.placeholderTitle}>{leaderboardCopy.profile.privateTitle}</Text>
          <Text style={styles.placeholderBody}>
            {error ?? leaderboardCopy.profile.privateBody}
          </Text>
        </View>
      </FigmaScreen>
    );
  }

  const nameLabel = profile.displayName;
  const usernameLabel = profile.username ? `@${profile.username}` : null;
  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={leaderboardCopy.profile.collectorProfile}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <View style={styles.avatarWrap}>
            <ProfileAvatar url={profile.avatarUrl} name={nameLabel} size={s(100)} />
            {rank != null ? (
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>{rank}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{nameLabel}</Text>
              <Image source={figmaIcons.metaShield} style={styles.shield} resizeMode="contain" />
            </View>
            {usernameLabel ? <Text style={styles.heroUsername}>{usernameLabel}</Text> : null}
            {profile.locationText ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={s(14)} color={figmaColors.gray} />
                <Text style={styles.metaText}>{profile.locationText}</Text>
              </View>
            ) : null}
            {joinedLabel ? (
              <View style={styles.metaRow}>
                <Image source={figmaIcons.metaCalendar} style={styles.metaIcon} resizeMode="contain" />
                <Text style={styles.metaText}>
                  {leaderboardCopy.profile.joined} {joinedLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {rank != null && points != null ? (
          <View style={styles.rankCard}>
            <Image source={figmaIcons.trophyRanking} style={styles.trophy} resizeMode="contain" />
            <Text style={styles.rankCardLabel}>{leaderboardCopy.profile.globalRank}</Text>
            <Text style={styles.rankCardValue}>#{rank}</Text>
            <Text style={styles.rankCardPts}>{formatPoints(points)} PTS</Text>
            <Text style={styles.rankCardEvents}>
              {eventCount} {leaderboardCopy.profile.events.toLowerCase()}
            </Text>
          </View>
        ) : null}
      </View>

      {profile.about ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{leaderboardCopy.profile.about}</Text>
          <Text style={styles.sectionBody}>{profile.about}</Text>
        </View>
      ) : null}

      {breakdown.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{leaderboardCopy.profile.pointsBreakdown}</Text>
          <ProfilePointsBreakdown
            groups={breakdown}
            totalPoints={points ?? 0}
            s={s}
            t={t}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{leaderboardCopy.profile.recentActivity}</Text>
        {events.length > 0 ? (
          <ProfilePointHistory events={events.slice(0, 25)} s={s} t={t} />
        ) : (
          <Text style={styles.emptyActivity}>{leaderboardCopy.profile.noActivity}</Text>
        )}
      </View>
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
      gap: s(12),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      padding: s(16),
      marginBottom: s(18)
    },
    heroLeft: {
      flex: 1,
      gap: s(12)
    },
    avatarWrap: {
      alignSelf: 'flex-start'
    },
    rankBadge: {
      position: 'absolute',
      bottom: -s(4),
      right: -s(4),
      width: s(28),
      height: s(28),
      borderRadius: s(14),
      backgroundColor: figmaColors.bronze,
      borderWidth: 2,
      borderColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    },
    rankBadgeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.cream
    },
    identity: {
      gap: s(4)
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    heroName: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      lineHeight: t(28),
      color: figmaColors.charcoal,
      flexShrink: 1
    },
    shield: {
      width: s(18),
      height: s(18)
    },
    heroUsername: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      marginTop: s(2)
    },
    metaIcon: {
      width: s(14),
      height: s(14)
    },
    metaText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray
    },
    rankCard: {
      width: s(120),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(14),
      alignItems: 'center',
      paddingVertical: s(12),
      paddingHorizontal: s(8),
      gap: s(2)
    },
    trophy: {
      width: s(32),
      height: s(32),
      marginBottom: s(4)
    },
    rankCardLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      textAlign: 'center'
    },
    rankCardValue: {
      fontFamily: appFonts.display,
      fontSize: t(28),
      lineHeight: t(32),
      color: figmaColors.charcoal
    },
    rankCardPts: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      color: figmaColors.textAccent
    },
    rankCardEvents: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray,
      marginTop: s(2)
    },
    section: {
      marginBottom: s(20)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: s(10)
    },
    sectionBody: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      lineHeight: tb(26),
      color: figmaColors.charcoal
    },
    emptyActivity: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.gray,
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16)
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
