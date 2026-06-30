import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type RatingStarsProps = {
  value: number | null;
  max?: number;
  interactive?: boolean;
  userValue?: number | null;
  onSelect?: (rating: number) => void;
  disabled?: boolean;
  showScore?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function RatingStars({
  value,
  max = 5,
  interactive = false,
  userValue,
  onSelect,
  disabled,
  showScore = true,
  s,
  t
}: RatingStarsProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const display = interactive ? (userValue ?? 0) : (value ?? 0);

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const filled = n <= display;
          const star = (
            <View style={[styles.starStamp, filled && styles.starStampFilled]}>
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={s(18)}
                color={filled ? figmaColors.cream : figmaColors.bronze}
              />
            </View>
          );
          if (interactive && onSelect) {
            return (
              <Pressable
                key={n}
                onPress={() => onSelect(n)}
                disabled={disabled}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${n} of ${max}`}
              >
                {star}
              </Pressable>
            );
          }
          return <View key={n}>{star}</View>;
        })}
      </View>
      {showScore && !interactive && value != null ? (
        <Text style={styles.score}>{value.toFixed(1)}</Text>
      ) : null}
      {showScore && !interactive && value == null ? (
        <Text style={styles.unrated}>—</Text>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      flexWrap: 'wrap'
    },
    stars: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
    },
    starStamp: {
      width: s(28),
      height: s(28),
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    },
    starStampFilled: {
      backgroundColor: figmaColors.bronze,
      borderColor: figmaColors.accent
    },
    score: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    unrated: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.textMuted
    }
  });
}
