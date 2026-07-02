/**
 * Top-3 podium — Root.png background + flex columns + per-slot vertical stack.
 *
 * Layout model (matches Figma art, scales on any width):
 *   [ImageBackground Root.png]
 *     row → 3 columns (flex 286 : 354 : 286)
 *       each column → top spacer | card zone | pedestal spacer
 *         card zone → avatar → rank laurel → name → role → points pill
 */
import React, { useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  Image,
  ImageBackground,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { LeaderboardPointsPill } from '@/components/figma/LeaderboardPointsPill';
import {
  PODIUM_LAYOUT,
  PODIUM_RANK_THEME,
  leaderboardAssets
} from '@/constants/leaderboardAssets';
import { formatPoints } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import { inferCollectorRole } from '@/lib/leaderboard-ui';
import {
  computePodiumSlotMetrics,
  podiumMinHeight,
  type PodiumSlotSize
} from '@/lib/podium-layout';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  top3: LeaderboardEntry[];
  currentUserId?: string | null;
  onPressUser?: (entry: LeaderboardEntry) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

function PodiumSlot({
  entry,
  rank,
  currentUserId,
  onPressUser,
  s,
  t,
  styles
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  currentUserId?: string | null;
  onPressUser?: (entry: LeaderboardEntry) => void;
  s: (n: number) => number;
  t: (n: number) => number;
  styles: ReturnType<typeof createStyles>;
}) {
  const layout = PODIUM_LAYOUT[rank];
  const theme = PODIUM_RANK_THEME[rank];
  const [cardSize, setCardSize] = useState<PodiumSlotSize>({ width: 0, height: 0 });

  const isSelf = currentUserId != null && entry.userId === currentUserId;
  const nameLabel = entry.displayName || entry.username || 'Collector';
  const roleLabel = inferCollectorRole(entry.userId);
  const ready = cardSize.width > 0 && cardSize.height > 0;
  const m = ready ? computePodiumSlotMetrics(rank, cardSize, s) : null;

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const w = Math.round(width);
    const h = Math.round(height);
    if (w > 0 && (w !== cardSize.width || h !== cardSize.height)) {
      setCardSize({ width: w, height: h });
    }
  };

  return (
    <Pressable
      style={[styles.column, { flex: layout.colFlex }]}
      onPress={onPressUser ? () => onPressUser(entry) : undefined}
      disabled={!onPressUser}
      accessibilityRole="button"
      accessibilityLabel={`Rank ${rank}: ${nameLabel}, ${formatPoints(entry.points)} points`}
    >
      <View style={{ flex: layout.topFlex }} />

      <View style={[styles.card, { flex: layout.cardFlex }]} onLayout={onCardLayout}>
        {ready && m ? (
          <View style={styles.cardContent}>
            <View style={[styles.avatarWrap, { width: m.ring, height: m.ring }]}>
              <Image
                source={theme.avatarRing}
                style={{ width: m.ring, height: m.ring, position: 'absolute' }}
                resizeMode="contain"
              />
              <ProfileAvatar url={entry.avatarUrl} name={nameLabel} size={m.avatar} />
            </View>

            <Image
              source={theme.laurel}
              style={{ width: m.laurel, height: m.laurel, marginTop: m.gap }}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.name,
                { fontSize: m.nameSize, lineHeight: m.nameSize + 3, marginTop: m.gap }
              ]}
              numberOfLines={1}
            >
              {nameLabel}
            </Text>

            <Text
              style={{
                fontFamily: appFonts.body,
                fontSize: m.roleSize,
                lineHeight: m.roleSize + 2,
                color: figmaColors.gray,
                textAlign: 'center',
                marginTop: 2
              }}
              numberOfLines={1}
            >
              {roleLabel}
            </Text>

            <View style={{ marginTop: m.gap, alignItems: 'center' }}>
              <LeaderboardPointsPill
                points={entry.points}
                pillSource={theme.pointsPill}
                s={s}
                t={t}
                width={m.pillW}
                height={m.pillH}
                fontSize={Math.max(9, m.pillH * 0.48)}
              />
              {isSelf ? (
                <Text style={[styles.youTag, { fontSize: m.youSize, marginTop: 2 }]}>YOU</Text>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>

      <View style={{ flex: layout.baseFlex }} />
    </Pressable>
  );
}

export function LeaderboardPodium({ top3, currentUserId, onPressUser, s, t }: Props) {
  const styles = useMemo(() => createStyles(s), [s]);
  const slots = [top3[1], top3[0], top3[2]].filter(Boolean) as LeaderboardEntry[];

  if (slots.length === 0) return null;

  return (
    <ImageBackground
      source={leaderboardAssets.podiumRoot}
      style={styles.root}
      imageStyle={styles.rootImage}
      resizeMode="stretch"
    >
      <View style={styles.row}>
        {slots.map((entry) => (
          <PodiumSlot
            key={entry.userId}
            entry={entry}
            rank={entry.rank as 1 | 2 | 3}
            currentUserId={currentUserId}
            onPressUser={onPressUser}
            s={s}
            t={t}
            styles={styles}
          />
        ))}
      </View>
    </ImageBackground>
  );
}

function createStyles(s: (n: number) => number) {
  return StyleSheet.create({
    root: {
      width: '100%',
      minHeight: podiumMinHeight(s),
      marginBottom: s(20)
    },
    rootImage: {
      width: '100%',
      height: '100%'
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: '1.5%'
    },
    column: {
      alignItems: 'center'
    },
    card: {
      width: '100%',
      alignItems: 'center',
      overflow: 'visible'
    },
    cardContent: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    avatarWrap: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    name: {
      fontFamily: appFonts.bodyBold,
      color: figmaColors.charcoal,
      textAlign: 'center',
      width: '100%'
    },
    youTag: {
      fontFamily: appFonts.accent,
      color: figmaColors.navActive,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    }
  });
}
