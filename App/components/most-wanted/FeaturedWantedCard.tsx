import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import { figmaColors } from '@/constants/figmaColors';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { huntDisplayTitle, type MostWantedHuntRow } from '@/lib/most-wanted';

type FeaturedWantedCardProps = {
  hunt: MostWantedHuntRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onPress: () => void;
};

export function FeaturedWantedCard({ hunt, s, t, onPress }: FeaturedWantedCardProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const primaryNeed = hunt.needed_labels[0] ?? 'Evidence';
  const total = Math.max(hunt.requirements_total, 1);
  const pct = Math.min(100, Math.round((hunt.requirements_fulfilled / total) * 100));
  const fillColor =
    hunt.status === 'near_solved' || pct >= 75 ? figmaColors.success : figmaColors.progressFill;

  const meta = [hunt.team_name, hunt.product_year].filter(Boolean).join(' • ');
  const highPriority = hunt.priority_tag === 'high_value';
  const nearSolved = hunt.status === 'near_solved';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.bannerWrap}>
        <View style={styles.banner}>
          <Image source={mostWantedIcons.starFilled} style={styles.bannerStar} resizeMode="contain" />
          <Text style={styles.bannerText}>FEATURED</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.imageCol}>
          <HuntCardImage
            coverImageUrl={hunt.cover_image_url}
            imageUrl={hunt.imageUrl}
            style={styles.image}
            framed
            s={s}
          />
        </View>

        <View style={styles.rightArea}>
          <View style={styles.topRow}>
            <View style={styles.titleCol}>
              <Text style={styles.title} numberOfLines={2}>
                {huntDisplayTitle(hunt)}
              </Text>
              {meta ? <Text style={styles.meta}>{meta}</Text> : null}
              <Text style={styles.summary} numberOfLines={2}>
                Priority need · {primaryNeed}
              </Text>
            </View>

            <View style={styles.rightRail}>
              {highPriority || nearSolved ? (
                <View
                  style={[styles.priorityBox, nearSolved && !highPriority && styles.priorityBoxSolved]}
                >
                  <Image
                    source={mostWantedIcons.shieldDark}
                    style={styles.priorityIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.priorityText}>
                    {highPriority ? 'HIGH\nPRIORITY' : 'NEAR\nSOLVED'}
                  </Text>
                </View>
              ) : null}
              <View style={styles.railDivider} />
              <View style={styles.statsCol}>
                <View style={styles.statRow}>
                  <Image source={mostWantedIcons.eye} style={styles.statIcon} resizeMode="contain" />
                  <Text style={styles.statValue}>{hunt.watcher_count}</Text>
                </View>
                {(hunt.comment_count ?? 0) > 0 ? (
                  <View style={styles.statRow}>
                    <Image
                      source={mostWantedIcons.comment}
                      style={styles.statIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.statValue}>{hunt.comment_count}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.progressRow}>
            <Image
              source={mostWantedIcons.evidenceDoc}
              style={styles.progressIcon}
              resizeMode="contain"
            />
            <Text style={styles.progressLabel}>Evidence Progress</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardFeaturedBg,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      borderTopLeftRadius: s(20),
      marginBottom: s(18),
      paddingHorizontal: s(14),
      paddingBottom: s(14)
    },
    pressed: { opacity: 0.95 },
    bannerWrap: {
      flexDirection: 'row',
      marginLeft: s(-14),
      marginBottom: s(8)
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7),
      backgroundColor: figmaColors.stone,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderTopLeftRadius: s(20),
      borderBottomRightRadius: s(10),
      paddingHorizontal: s(16),
      paddingVertical: s(7)
    },
    bannerStar: { width: s(13), height: s(13) },
    bannerText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 1,
      color: figmaColors.brown
    },
    contentRow: {
      flexDirection: 'row',
      gap: s(12)
    },
    imageCol: { width: '38%' },
    image: {
      width: '100%',
      height: s(150)
    },
    rightArea: { flex: 1 },
    topRow: {
      flexDirection: 'row',
      gap: s(10)
    },
    titleCol: {
      flex: 1,
      gap: s(5)
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(17),
      lineHeight: t(21),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(16),
      color: figmaColors.brownMuted
    },
    rightRail: {
      alignItems: 'flex-end',
      gap: s(8)
    },
    priorityBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      paddingHorizontal: s(8),
      paddingVertical: s(6)
    },
    priorityBoxSolved: {
      backgroundColor: figmaColors.successBg,
      borderColor: figmaColors.success
    },
    priorityIcon: { width: s(15), height: s(18) },
    priorityText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      lineHeight: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    railDivider: {
      alignSelf: 'stretch',
      height: 1,
      backgroundColor: figmaColors.borderLight
    },
    statsCol: {
      gap: s(6),
      alignItems: 'flex-start',
      alignSelf: 'stretch',
      paddingLeft: s(4)
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7)
    },
    statIcon: { width: s(14), height: s(12) },
    statValue: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(10),
      marginBottom: s(6)
    },
    progressIcon: { width: s(12), height: s(14) },
    progressLabel: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    progressPct: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.brownMuted
    },
    track: {
      height: s(7),
      backgroundColor: figmaColors.progressTrack,
      borderRadius: s(4),
      overflow: 'hidden'
    },
    fill: {
      height: '100%',
      borderRadius: s(4)
    }
  });
}
