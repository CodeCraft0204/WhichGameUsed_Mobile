import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthPasswordStrengthProps = {
  score: number;
  maxScore?: number;
  label: string;
  weakLabel: string;
  strongLabel: string;
};

export function AuthPasswordStrength({
  score,
  maxScore = 5,
  label,
  weakLabel,
  strongLabel
}: AuthPasswordStrengthProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.segments}>
        {Array.from({ length: maxScore }, (_, i) => (
          <View
            key={i}
            style={[styles.segment, i < score ? styles.segmentFilled : styles.segmentEmpty]}
          />
        ))}
      </View>
      <View style={styles.ends}>
        <Text style={styles.endLabel}>{weakLabel}</Text>
        <Text style={styles.endLabel}>{strongLabel}</Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      marginTop: s(8),
      marginBottom: s(4),
      gap: s(6)
    },
    label: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(12),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    segments: {
      flexDirection: 'row',
      gap: s(6)
    },
    segment: {
      flex: 1,
      height: s(6),
      borderRadius: s(3)
    },
    segmentFilled: {
      backgroundColor: figmaColors.accent
    },
    segmentEmpty: {
      backgroundColor: figmaColors.borderLight
    },
    ends: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    endLabel: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(11),
      lineHeight: t(14),
      color: figmaColors.gray
    }
  });
}
