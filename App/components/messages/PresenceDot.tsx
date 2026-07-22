import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { presenceColor, type PresenceStatus } from '@/lib/presence';

type Props = {
  status: PresenceStatus;
  size?: number;
  borderColor?: string;
};

/** Small status pip for avatars / chat headers. */
export function PresenceDot({ status, size = 10, borderColor = '#fff' }: Props) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dot: {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: presenceColor(status),
          borderWidth: Math.max(1, size / 5),
          borderColor
        }
      }),
    [borderColor, size, status]
  );

  return <View style={styles.dot} accessibilityLabel={status} />;
}
