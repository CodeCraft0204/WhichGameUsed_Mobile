/**
 * Public collector profile — Figma collector page layout.
 */
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileAchievementBadges } from '@/components/profile/ProfileAchievementBadges';
import { ProfileContributorBadges } from '@/components/profile/ProfileContributorBadges';
import { ProfileReputationSection } from '@/components/profile/ProfileReputationSection';
import { ProfilePointHistory } from '@/components/profile/ProfilePointHistory';
import { ProfilePointsBreakdown } from '@/components/profile/ProfilePointsBreakdown';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { DonutGiftButton } from '@/components/reputation/DonutGiftButton';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { LEADERBOARD_EVENT_GROUPS } from '@/constants/leaderboardEventLabels';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { BREAKDOWN_ICONS, leaderboardAssets, PODIUM_RANK_THEME } from '@/constants/leaderboardAssets';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import {
  discussionThreadHref,
  messageConversationHref,
  pointsWorkHref,
  profileFollowersHref,
  profileFollowingHref
} from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
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
import {
  buildProfileBadges,
  buildProfileStats,
  formatTopPercent,
  profileTagline,
  rankTheme
} from '@/lib/leaderboard-ui';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useAuth } from '@/context/AuthContext';
import { getOrCreateDirectConversation } from '@/lib/messages';
import {
  canMessageUser,
  checkIsFollowing,
  fetchFollowCounts,
  listUserForumThreads,
  toggleFollow,
  type FollowCounts
} from '@/lib/social';
import {
  listUserConfirmedContributorBadges,
  type UserConfirmedContributorBadge
} from '@/lib/most-wanted';
import { fetchReputationProfile, type ReputationProfile } from '@/lib/reputation';

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
  const { user } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const period = parsePeriod(periodParam);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [rank, setRank] = useState<number | null>(parseOptionalInt(rankParam));
  const [points, setPoints] = useState<number | null>(parseOptionalInt(pointsParam));
  const [events, setEvents] = useState<PointEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followCounts, setFollowCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [messageAllowed, setMessageAllowed] = useState(false);
  const [messageBusy, setMessageBusy] = useState(false);
  const [forumThreads, setForumThreads] = useState<
    Awaited<ReturnType<typeof listUserForumThreads>>['items']
  >([]);
  const [confirmedBadges, setConfirmedBadges] = useState<UserConfirmedContributorBadge[]>([]);
  const [reputation, setReputation] = useState<ReputationProfile | null>(null);

  const isSelf = Boolean(user?.id && id && user.id === id);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id) return;
    if (!opts?.silent) setLoading(true);
    setError(null);

    const socialPromises = !isSelf && user
      ? Promise.all([
          checkIsFollowing(id),
          canMessageUser(id)
        ])
      : Promise.resolve([
          { isFollowing: false, error: null },
          { allowed: false, error: null }
        ] as const);

    const [profileRes, standingRes, eventsRes, countsRes, threadsRes, socialRes, badgesRes, repRes] =
      await Promise.all([
        fetchPublicProfile(id),
        getUserStanding(id, period),
        listUserPointEvents(id, { period, limit: 200 }),
        fetchFollowCounts(id),
        listUserForumThreads(id, 5),
        socialPromises,
        listUserConfirmedContributorBadges(id),
        fetchReputationProfile(id)
      ]);

    setProfile(profileRes.profile);
    setError(profileRes.error);
    setFollowCounts(countsRes.counts);
    setForumThreads(threadsRes.items);
    setConfirmedBadges(badgesRes.items);
    setReputation(repRes.profile);

    if (!isSelf && user) {
      const [followRes, messageRes] = socialRes;
      setIsFollowing(followRes.isFollowing);
      setMessageAllowed(messageRes.allowed);
    }

    if (standingRes.entry) {
      setRank(standingRes.entry.rank);
      setPoints(standingRes.entry.points);
    }

    setEvents(eventsRes.items);
    setLoading(false);
  }, [id, isSelf, period, user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useLeaderboardRealtime(() => { void load({ silent: true }); }, !!id);

  const breakdown = useMemo(
    () => buildPointBreakdown(events, LEADERBOARD_EVENT_GROUPS),
    [events]
  );
  const stats = useMemo(
    () => buildProfileStats(events, points ?? 0),
    [events, points]
  );
  const badges = useMemo(() => buildProfileBadges(breakdown), [breakdown]);
  const tagline = useMemo(() => profileTagline(breakdown), [breakdown]);
  const activitySlice = showAllActivity ? events.slice(0, 25) : events.slice(0, 5);

  const handleToggleFollow = async () => {
    if (!id || isSelf || followBusy) return;
    setFollowBusy(true);
    const { isFollowing: next, error: followError } = await toggleFollow(id);
    setFollowBusy(false);
    if (followError) {
      setError(followError);
      return;
    }
    setIsFollowing(next);
    const { counts } = await fetchFollowCounts(id);
    setFollowCounts(counts);
  };

  const handleMessage = async () => {
    if (!id || !messageAllowed || !user || messageBusy) return;
    setMessageBusy(true);
    setError(null);
    const { conversationId, error: messageError } = await getOrCreateDirectConversation(id);
    setMessageBusy(false);
    if (messageError || !conversationId) {
      setError(messageError ?? socialCopy.compose.notAllowed);
      return;
    }
    router.push(messageConversationHref(conversationId));
  };

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
  const joinedLabel = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;
  const rankVisual = rank != null ? rankTheme(rank) : null;
  const isTopThree = rank === 1 || rank === 2 || rank === 3;
  const podiumTheme = isTopThree ? PODIUM_RANK_THEME[rank] : null;

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={leaderboardCopy.profile.collectorProfile}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      {/* Hero row */}
      <View style={styles.heroRow}>
        <View style={styles.heroMain}>
          <View style={styles.avatarStack}>
            <Image
              source={podiumTheme?.avatarRing ?? leaderboardAssets.avatarRingGold}
              style={styles.avatarRing}
              resizeMode="contain"
            />
            <ProfileAvatar url={profile.avatarUrl} name={nameLabel} size={s(112)} />
            {podiumTheme ? (
              <Image
                source={podiumTheme.laurel}
                style={styles.rankBadge}
                resizeMode="contain"
                accessibilityLabel={`Rank ${rank}`}
              />
            ) : null}
          </View>

          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{nameLabel}</Text>
              <Image source={figmaIcons.metaShield} style={styles.shield} resizeMode="contain" />
            </View>
            <Text style={styles.tagline}>{tagline}</Text>
            {profile.locationText ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={s(13)} color={figmaColors.gray} />
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

        {rank != null && rankVisual ? (
          <View style={styles.globalRankCard}>
            <Text style={[styles.globalRankLabel, { color: rankVisual.accent }]}>
              {leaderboardCopy.profile.globalRank}
            </Text>
            <Text style={[styles.globalRankValue, { color: rankVisual.accent }]}>{rank}</Text>
            <Text style={[styles.globalRankPct, { color: rankVisual.accentMuted }]}>
              {formatTopPercent(rank)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Follow counts */}
      <View style={styles.followRow}>
        <Pressable
          onPress={() => router.push(profileFollowersHref(id))}
          style={styles.followStat}
          accessibilityRole="button"
        >
          <Text style={styles.followValue}>{followCounts.followers}</Text>
          <Text style={styles.followLabel}>{leaderboardCopy.profile.followers}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(profileFollowingHref(id))}
          style={styles.followStat}
          accessibilityRole="button"
        >
          <Text style={styles.followValue}>{followCounts.following}</Text>
          <Text style={styles.followLabel}>{leaderboardCopy.profile.followingCount}</Text>
        </Pressable>
      </View>

      {/* Badge pills */}
      <View style={styles.badgesRow}>
        {badges.map((badge) => (
          <View key={badge.key} style={styles.badgePill}>
            <Image
              source={
                badge.icon === 'research'
                  ? BREAKDOWN_ICONS.research
                  : badge.icon === 'auth'
                    ? BREAKDOWN_ICONS.auth
                    : BREAKDOWN_ICONS.other
              }
              style={styles.badgeIcon}
              resizeMode="contain"
            />
            <Text style={styles.badgeText}>{badge.label}</Text>
          </View>
        ))}
      </View>

      <ProfileReputationSection profile={reputation} s={s} t={t} />
      {!isSelf && user && id ? (
        <View style={{ marginBottom: s(12) }}>
          <DonutGiftButton
            toUserId={id}
            targetType="profile"
            targetId={id}
            s={s}
            t={t}
          />
        </View>
      ) : null}
      <ProfileAchievementBadges
        awards={(reputation?.badges ?? []).map((b) => ({
          badgeKey: b.badgeKey,
          label: b.label,
          awardedAt: b.awardedAt
        }))}
        s={s}
        t={t}
      />
      <ProfileContributorBadges badges={confirmedBadges} s={s} t={t} />

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatCell
          icon={leaderboardAssets.ctaTrophy}
          value={formatPoints(stats.totalPoints)}
          label={leaderboardCopy.profile.totalPoints}
          s={s}
          t={t}
        />
        <StatCell
          icon={BREAKDOWN_ICONS.auth}
          value={String(stats.authCount)}
          label={leaderboardCopy.profile.cardsAuthenticated}
          s={s}
          t={t}
        />
        <StatCell
          icon={BREAKDOWN_ICONS.research}
          value={String(stats.evidenceCount)}
          label={leaderboardCopy.profile.evidenceUploads}
          s={s}
          t={t}
        />
        <StatCell
          icon={BREAKDOWN_ICONS.forum}
          value={String(stats.discussionCount)}
          label={leaderboardCopy.profile.discussions}
          s={s}
          t={t}
        />
      </View>

      {/* About */}
      {profile.about ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{leaderboardCopy.profile.about}</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutText}>{profile.about}</Text>
            <Image source={leaderboardAssets.pointsChest} style={styles.aboutArt} resizeMode="contain" />
          </View>
        </View>
      ) : null}

      {/* Points breakdown */}
      {breakdown.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInline}>{leaderboardCopy.profile.pointsBreakdown}</Text>
            <View style={styles.sectionHeaderRight}>
              <Text style={styles.sectionMeta}>
                Total {formatPoints(points ?? 0)} PTS
              </Text>
              <Pressable
                onPress={() => router.push(pointsWorkHref())}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text style={styles.pointsGuideLink}>{pointsWorkCopy.seeFullGuide}</Text>
              </Pressable>
            </View>
          </View>
          <ProfilePointsBreakdown groups={breakdown} totalPoints={points ?? 0} s={s} t={t} />
        </View>
      ) : null}

      {/* Recent forum threads */}
      {profile.showForumActivityOnProfile ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{socialCopy.profile.recentDiscussions}</Text>
          {forumThreads.length > 0 ? (
            forumThreads.map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() => router.push(discussionThreadHref(thread.id))}
                style={styles.threadRow}
                accessibilityRole="button"
              >
                <Text style={styles.threadTitle} numberOfLines={2}>
                  {thread.title}
                </Text>
                <Text style={styles.threadMeta}>
                  {thread.topicTitle} · {thread.commentCount} replies
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyActivity}>{socialCopy.profile.noDiscussions}</Text>
          )}
        </View>
      ) : null}

      {/* Recent activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleInline}>{leaderboardCopy.profile.recentActivity}</Text>
          {events.length > 5 ? (
            <Pressable onPress={() => setShowAllActivity((v) => !v)} accessibilityRole="button">
              <Text style={styles.viewAll}>
                {showAllActivity ? 'Show less' : `${leaderboardCopy.profile.viewAll} ›`}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {events.length > 0 ? (
          <ProfilePointHistory events={activitySlice} s={s} t={t} />
        ) : (
          <Text style={styles.emptyActivity}>{leaderboardCopy.profile.noActivity}</Text>
        )}
      </View>

      {/* Actions */}
      {!isSelf ? (
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.messageBtn, (!messageAllowed || messageBusy) && styles.actionDisabled]}
            accessibilityRole="button"
            disabled={!messageAllowed || messageBusy}
            onPress={() => void handleMessage()}
          >
            <Image source={BREAKDOWN_ICONS.forum} style={styles.actionIcon} resizeMode="contain" />
            <Text style={styles.messageBtnText}>{leaderboardCopy.profile.message}</Text>
          </Pressable>
          <Pressable
            style={[styles.followBtn, isFollowing ? styles.followBtnOutline : styles.followBtnPrimary]}
            accessibilityRole="button"
            accessibilityLabel={isFollowing ? 'Unfollow collector' : 'Follow collector'}
            disabled={followBusy}
            onPress={() => void handleToggleFollow()}
          >
            <Image
              source={leaderboardAssets.viewProfileIcon}
              style={[styles.actionIconLight, isFollowing && styles.actionIconDark]}
              resizeMode="contain"
            />
            <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextOutline]}>
              {isFollowing ? leaderboardCopy.profile.unfollow : leaderboardCopy.profile.follow}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </FigmaScreen>
  );
}

function StatCell({
  icon,
  value,
  label,
  s,
  t
}: {
  icon: number;
  value: string;
  label: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const tb = (n: number) => bodyText(t, n);
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: s(4) }}>
      <Image source={icon} style={{ width: s(28), height: s(28) }} resizeMode="contain" />
      <Text style={{ fontFamily: appFonts.bodyBold, fontSize: tb(18), color: figmaColors.charcoal }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: appFonts.accent,
          fontSize: tb(9),
          color: figmaColors.gray,
          textAlign: 'center',
          letterSpacing: 0.4,
          textTransform: 'uppercase'
        }}
      >
        {label}
      </Text>
    </View>
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
    heroRow: {
      flexDirection: 'row',
      gap: s(10),
      marginBottom: s(12),
      alignItems: 'flex-start'
    },
    heroMain: {
      flex: 1,
      flexDirection: 'row',
      gap: s(10),
      minWidth: 0
    },
    avatarStack: {
      width: s(118),
      height: s(132),
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexShrink: 0,
      paddingTop: s(3)
    },
    avatarRing: {
      position: 'absolute',
      top: s(3),
      width: s(118),
      height: s(118)
    },
    rankBadge: {
      position: 'absolute',
      bottom: 0,
      width: s(40),
      height: s(40)
    },
    identity: {
      flex: 1,
      gap: s(3),
      minWidth: 0,
      paddingTop: s(4)
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
    },
    heroName: {
      fontFamily: appFonts.display,
      fontSize: t(30),
      lineHeight: t(34),
      color: figmaColors.charcoal,
      flexShrink: 1
    },
    shield: {
      width: s(18),
      height: s(18)
    },
    tagline: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      fontStyle: 'italic',
      color: figmaColors.gray,
      lineHeight: tb(19)
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
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
    globalRankCard: {
      width: s(108),
      backgroundColor: figmaColors.tabActiveBg,
      borderRadius: s(12),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(16),
      paddingHorizontal: s(8),
      flexShrink: 0,
      gap: s(4)
    },
    globalRankLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      textAlign: 'center'
    },
    globalRankValue: {
      fontFamily: appFonts.display,
      fontSize: t(40),
      lineHeight: t(42)
    },
    globalRankPct: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      letterSpacing: 0.8,
      marginTop: s(2)
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginBottom: s(14)
    },
    followRow: {
      flexDirection: 'row',
      gap: s(24),
      marginBottom: s(12)
    },
    followStat: { alignItems: 'center', gap: s(2) },
    followValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(18),
      color: figmaColors.charcoal
    },
    followLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.gray,
      letterSpacing: 0.5,
      textTransform: 'uppercase'
    },
    threadRow: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      padding: s(12),
      marginBottom: s(8),
      gap: s(4)
    },
    threadTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    threadMeta: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    },
    badgePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      backgroundColor: figmaColors.surfaceElevated,
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    badgeIcon: {
      width: s(16),
      height: s(16)
    },
    badgeText: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.charcoal
    },
    statsBar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: figmaColors.divider,
      paddingVertical: s(14),
      marginBottom: s(16)
    },
    section: {
      marginBottom: s(18)
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(10)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: s(8)
    },
    sectionTitleInline: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 1.2
    },
    sectionMeta: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      color: figmaColors.charcoal
    },
    sectionHeaderRight: {
      alignItems: 'flex-end',
      gap: s(2)
    },
    pointsGuideLink: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.navActive,
      letterSpacing: 0.3
    },
    aboutRow: {
      flexDirection: 'row',
      gap: s(10),
      alignItems: 'flex-end'
    },
    aboutText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.charcoal
    },
    aboutTextMuted: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray
    },
    aboutArt: {
      width: s(96),
      height: s(80),
      flexShrink: 0
    },
    viewAll: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    },
    emptyActivity: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray,
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14)
    },
    actionsRow: {
      flexDirection: 'row',
      gap: s(10),
      marginBottom: s(12)
    },
    messageBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      paddingVertical: s(14)
    },
    messageBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.charcoal,
      letterSpacing: 0.8
    },
    followBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      borderRadius: s(12),
      paddingVertical: s(14)
    },
    followBtnPrimary: {
      backgroundColor: figmaColors.tabActiveBg
    },
    followBtnOutline: {
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      backgroundColor: figmaColors.cream
    },
    followBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: '#C9A84C',
      letterSpacing: 0.8
    },
    followBtnTextOutline: {
      color: figmaColors.charcoal
    },
    actionIconDark: {
      tintColor: figmaColors.charcoal
    },
    actionDisabled: { opacity: 0.45 },
    actionIcon: {
      width: s(20),
      height: s(20)
    },
    actionIconLight: {
      width: s(20),
      height: s(20),
      tintColor: '#C9A84C'
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
