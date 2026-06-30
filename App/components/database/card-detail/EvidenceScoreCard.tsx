import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RatingStars } from '@/components/database/card-detail/RatingStars';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type EvidenceScoreCardProps = {
  label: string;
  value: number | null;
  explanation: string;
  footnote?: string;
  interactive?: boolean;
  userValue?: number | null;
  onSelect?: (rating: number) => void;
  disabled?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EvidenceScoreCard({
  label,
  value,
  explanation,
  footnote,
  interactive,
  userValue,
  onSelect,
  disabled,
  s,
  t
}: EvidenceScoreCardProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <RatingStars
        value={value}
        interactive={interactive}
        userValue={userValue}
        onSelect={onSelect}
        disabled={disabled}
        s={s}
        t={t}
      />
      <Text style={styles.explanation}>{explanation}</Text>
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: figmaColors.divider,
      borderRadius: s(12),
      padding: s(12),
      backgroundColor: figmaColors.creamLight,
      gap: s(8)
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.brown,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },
    explanation: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(20),
      color: figmaColors.textSecondary
    },
    footnote: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.textMuted
    }
  });
}
