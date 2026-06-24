import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import type { CardResearchRatings } from '@/lib/card-research-ratings';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type ResearchRatingPanelProps = {
  ratings: CardResearchRatings;
  onVote?: (rating: number) => void;
  voteBusy?: boolean;
  signedIn?: boolean;
};

function RatingRow({
  label,
  value,
  max = 5,
  interactive,
  userValue,
  onSelect,
  disabled,
  styles,
  s
}: {
  label: string;
  value: number | null;
  max?: number;
  interactive?: boolean;
  userValue?: number | null;
  onSelect?: (n: number) => void;
  disabled?: boolean;
  styles: ReturnType<typeof createStyles>;
  s: (n: number) => number;
}) {
  const display = interactive ? (userValue ?? 0) : (value ?? 0);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.marks}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const filled = n <= display;
          const icon = (
            <Ionicons
              name={filled ? 'shield' : 'shield-outline'}
              size={s(22)}
              color={filled ? figmaColors.bronze : figmaColors.gray}
            />
          );
          if (interactive && onSelect) {
            return (
              <Pressable
                key={n}
                onPress={() => onSelect(n)}
                disabled={disabled}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${n} of ${max}`}
              >
                {icon}
              </Pressable>
            );
          }
          return <View key={n}>{icon}</View>;
        })}
        {!interactive && value == null ? (
          <Text style={styles.unrated}>Not rated</Text>
        ) : null}
        {!interactive && value != null ? (
          <Text style={styles.score}>{value.toFixed(1)}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function ResearchRatingPanel({
  ratings,
  onVote,
  voteBusy = false,
  signedIn = false
}: ResearchRatingPanelProps) {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Research ratings</Text>
      <RatingRow
        label="Admin"
        value={ratings.adminRating}
        styles={styles}
        s={s}
      />
      <RatingRow
        label="Community"
        value={ratings.communityRating}
        styles={styles}
        s={s}
      />
      {ratings.communityVoteCount > 0 ? (
        <Text style={styles.votes}>{ratings.communityVoteCount} vote(s)</Text>
      ) : null}
      {signedIn ? (
        <RatingRow
          label="Your vote"
          value={null}
          interactive
          userValue={ratings.userRating}
          onSelect={onVote}
          disabled={voteBusy}
          styles={styles}
          s={s}
        />
      ) : (
        <Text style={styles.signInHint}>Sign in to rate this research.</Text>
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
      borderRadius: s(12),
      padding: s(14),
      backgroundColor: figmaColors.inputBg,
      gap: s(10),
      marginBottom: s(16)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal
    },
    row: { gap: s(6) },
    rowLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.gray,
      letterSpacing: 0.6
    },
    marks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      flexWrap: 'wrap'
    },
    score: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.charcoal,
      marginLeft: s(4)
    },
    unrated: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.textMuted,
      marginLeft: s(4)
    },
    votes: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    },
    signInHint: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray
    }
  });
}
