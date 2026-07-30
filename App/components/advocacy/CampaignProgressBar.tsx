import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { clampAdvocacyProgress } from '@/lib/advocacy-format';

type Props = {
  progress: number | null | undefined;
  s: (n: number) => number;
  style?: StyleProp<ViewStyle>;
};

export function CampaignProgressBar({ progress, s, style }: Props) {
  const pct = clampAdvocacyProgress(progress) * 100;
  return (
    <View style={[styles.track, { height: s(8), borderRadius: s(4) }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            borderRadius: s(4)
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: figmaColors.progressTrack,
    overflow: 'hidden'
  },
  fill: {
    height: '100%',
    backgroundColor: figmaColors.progressFill
  }
});
