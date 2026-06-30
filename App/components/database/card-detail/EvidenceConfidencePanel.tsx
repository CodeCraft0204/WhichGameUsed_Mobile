import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EvidenceScoreCard } from '@/components/database/card-detail/EvidenceScoreCard';
import { cardDetailCopy } from '@/constants/cardDetailCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  computeFinalScore,
  confidenceFromScore,
  confidenceLabel,
  confidenceProgress
} from '@/lib/card-detail-ui';
import type { CardResearchRatings } from '@/lib/card-research-ratings';

type EvidenceConfidencePanelProps = {
  ratings: CardResearchRatings;
  signedIn?: boolean;
  voteBusy?: boolean;
  onVote?: (rating: number) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EvidenceConfidencePanel({
  ratings,
  signedIn = false,
  voteBusy = false,
  onVote,
  s,
  t
}: EvidenceConfidencePanelProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const finalScore = computeFinalScore(ratings);
  const level = confidenceFromScore(finalScore);
  const progress = confidenceProgress(finalScore);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{cardDetailCopy.evidenceConfidence}</Text>

      <View style={styles.scores}>
        <EvidenceScoreCard
          label={cardDetailCopy.wguRating}
          value={ratings.adminRating}
          explanation={cardDetailCopy.wguExplanation}
          s={s}
          t={t}
        />
        <EvidenceScoreCard
          label={cardDetailCopy.communityRating}
          value={ratings.communityRating}
          explanation={cardDetailCopy.communityExplanation}
          footnote={
            ratings.communityVoteCount > 0
              ? cardDetailCopy.votes(ratings.communityVoteCount)
              : undefined
          }
          s={s}
          t={t}
        />
        <EvidenceScoreCard
          label={cardDetailCopy.finalScore}
          value={finalScore}
          explanation={cardDetailCopy.finalExplanation}
          s={s}
          t={t}
        />
      </View>

      <View style={styles.meterBlock}>
        <View style={styles.meterTrack}>
          <View style={[styles.meterFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
        <View style={styles.meterLabelRow}>
          <Text style={styles.meterLabel}>{confidenceLabel(level)}</Text>
          {finalScore != null ? (
            <Text style={styles.meterScore}>{finalScore.toFixed(1)} / 5</Text>
          ) : null}
        </View>
      </View>

      {signedIn ? (
        <EvidenceScoreCard
          label={cardDetailCopy.yourVote}
          value={null}
          explanation=""
          interactive
          userValue={ratings.userRating}
          onSelect={onVote}
          disabled={voteBusy}
          s={s}
          t={t}
        />
      ) : (
        <Text style={styles.signInHint}>{cardDetailCopy.signInToRate}</Text>
      )}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    panel: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      padding: s(16),
      backgroundColor: figmaColors.surfaceElevated,
      marginBottom: s(20),
      gap: s(14),
      shadowColor: figmaColors.black,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.07,
      shadowRadius: s(8),
      elevation: 3
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal,
      letterSpacing: 0.5
    },
    scores: { gap: s(10) },
    meterBlock: { gap: s(8) },
    meterTrack: {
      height: s(10),
      borderRadius: s(5),
      backgroundColor: figmaColors.progressTrack,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    meterFill: {
      height: '100%',
      backgroundColor: figmaColors.progressFill,
      borderRadius: s(5)
    },
    meterLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    meterLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.brown,
      letterSpacing: 0.6
    },
    meterScore: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      color: figmaColors.charcoal
    },
    signInHint: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.textMuted,
      lineHeight: tb(20)
    }
  });
}
