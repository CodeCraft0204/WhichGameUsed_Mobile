import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { CardEvidenceAttributeStrip } from '@/components/reputation/CardEvidenceAttributeStrip';
import { DetectiveRankMini } from '@/components/reputation/DetectiveRankMini';
import { EvidenceQualityChip } from '@/components/reputation/EvidenceQualityChip';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import {
  reputationUiImages,
  type CardEvidenceAttributeKey
} from '@/constants/reputationContent';
import type { CardEvidenceFileSummary, CardResearcher } from '@/lib/reputation';

export function CardEvidenceFilePanel({
  summary,
  onPressResearcher,
  s,
  t
}: {
  summary: CardEvidenceFileSummary | null;
  onPressResearcher?: (researcher: CardResearcher) => void;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  if (!summary) return null;

  const keys = summary.attributes?.activeKeys ?? [];
  const hasBody =
    keys.length > 0 ||
    summary.topQualityLevel != null ||
    summary.donutsReceived > 0 ||
    summary.researchers.length > 0;

  if (!hasBody) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{reputationCopy.evidenceFileTitle}</Text>
        {summary.donutsReceived > 0 ? (
          <View style={styles.donutPill}>
            <Image source={reputationUiImages.donut} style={styles.donutIcon} resizeMode="contain" />
            <Text style={styles.donutPillText}>{summary.donutsReceived}</Text>
          </View>
        ) : null}
      </View>

      {keys.length > 0 ? (
        <CardEvidenceAttributeStrip
          activeKeys={keys as CardEvidenceAttributeKey[]}
          showTitle={false}
          s={s}
          t={t}
        />
      ) : null}

      <View style={styles.metaRow}>
        {summary.topQualityLevel != null ? (
          <View style={styles.metaBlock}>
            <Text style={styles.subhead}>{reputationCopy.qualityTitle}</Text>
            <EvidenceQualityChip level={summary.topQualityLevel} s={s} t={t} />
          </View>
        ) : null}
        {summary.donutsReceived > 0 ? (
          <Text style={styles.donutText}>
            {reputationCopy.cardDonutsReceived(summary.donutsReceived)}
          </Text>
        ) : null}
      </View>

      {summary.researchers.length > 0 ? (
        <View style={styles.researchers}>
          <Text style={styles.subhead}>{reputationCopy.researchersTitle}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.researcherStrip}>
              {summary.researchers.map((r) => {
                const name = r.displayName || r.username || 'Collector';
                const body = (
                  <View style={styles.researcherCard}>
                    <View style={styles.avatarWrap}>
                      <ProfileAvatar url={r.avatarUrl} name={name} size={s(40)} />
                      <View style={styles.rankBadge}>
                        <DetectiveRankMini level={r.rankLevel} s={s} size={18} />
                      </View>
                    </View>
                    <Text style={styles.researcherName} numberOfLines={1}>
                      {name}
                    </Text>
                  </View>
                );
                if (!onPressResearcher) {
                  return (
                    <View key={r.userId} style={styles.researcherWrap}>
                      {body}
                    </View>
                  );
                }
                return (
                  <Pressable
                    key={r.userId}
                    onPress={() => onPressResearcher(r)}
                    style={styles.researcherWrap}
                  >
                    {body}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    panel: {
      marginTop: s(10),
      marginBottom: s(4),
      padding: s(12),
      borderRadius: s(14),
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      gap: s(10)
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.8,
      color: figmaColors.charcoal
    },
    donutPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      borderRadius: s(999),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    donutPillText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.ink
    },
    donutIcon: { width: s(18), height: s(18) },
    subhead: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.6,
      color: figmaColors.brown,
      marginBottom: s(4)
    },
    metaRow: { gap: s(6) },
    metaBlock: { gap: s(2) },
    donutText: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.ink
    },
    researchers: { gap: s(6) },
    researcherStrip: { flexDirection: 'row', gap: s(10), paddingRight: s(8) },
    researcherWrap: { width: s(76) },
    researcherCard: { alignItems: 'center', gap: s(4) },
    avatarWrap: { position: 'relative' },
    rankBadge: { position: 'absolute', right: -4, bottom: -2 },
    researcherName: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.ink,
      textAlign: 'center'
    }
  });
}
