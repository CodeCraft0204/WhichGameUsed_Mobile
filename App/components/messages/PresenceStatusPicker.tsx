import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { PresenceDot } from '@/components/messages/PresenceDot';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  PRESENCE_OPTIONS,
  loadManualPresence,
  setMyPresenceStatus,
  subscribeManualPresence,
  type PresenceStatus
} from '@/lib/presence';

type Props = {
  s: (n: number) => number;
  t: (n: number) => number;
  compact?: boolean;
};

/** Lets the signed-in collector set Online / Away / Offline manually. */
export function PresenceStatusPicker({ s, t, compact = false }: Props) {
  const styles = useMemo(() => createStyles(s, t, compact), [s, t, compact]);
  const [status, setStatus] = useState<PresenceStatus>('online');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadManualPresence().then(setStatus);
    return subscribeManualPresence(setStatus);
  }, []);

  const onSelect = async (next: PresenceStatus) => {
    if (next === status || saving) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await setMyPresenceStatus(next);
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    setStatus(next);
  };

  return (
    <View style={styles.wrap}>
      {!compact ? <Text style={styles.label}>Your status</Text> : null}
      <View style={styles.row}>
        {PRESENCE_OPTIONS.map((opt) => {
          const active = status === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => void onSelect(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Set status ${opt.label}`}
            >
              <PresenceDot status={opt.value} size={s(10)} borderColor={figmaColors.cream} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
        {saving ? <ActivityIndicator size="small" color={figmaColors.charcoal} /> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact: boolean) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: {
      gap: s(8),
      marginBottom: compact ? s(10) : s(16)
    },
    label: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(13),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.6
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(8)
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      borderRadius: s(20)
    },
    chipActive: {
      borderColor: figmaColors.navActive,
      backgroundColor: 'rgba(61, 90, 128, 0.12)'
    },
    chipText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.charcoal
    },
    chipTextActive: {
      fontFamily: appFonts.bodyBold
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: '#b91c1c'
    }
  });
}
