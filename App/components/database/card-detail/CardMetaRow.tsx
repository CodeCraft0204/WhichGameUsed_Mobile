import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DatabaseMetaIconKey } from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

const iconMap: Record<DatabaseMetaIconKey, keyof typeof Ionicons.glyphMap> = {
  person: 'person-outline',
  baseball: 'baseball-outline',
  basketball: 'basketball-outline',
  calendar: 'calendar-outline',
  shield: 'shield-checkmark-outline'
};

type CardMetaRowProps = {
  icon: DatabaseMetaIconKey;
  label: string;
  value: string;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CardMetaRow({ icon, label, value, s, t }: CardMetaRowProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconMap[icon]} size={s(16)} color={figmaColors.bronze} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      paddingVertical: s(8)
    },
    iconWrap: {
      width: s(32),
      height: s(32),
      borderRadius: s(16),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(2)
    },
    body: { flex: 1, minWidth: 0 },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.gray,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(2)
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    }
  });
}
