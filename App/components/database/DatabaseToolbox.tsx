import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';

type DatabaseToolboxProps = {
  onFilter: () => void;
  onSort: () => void;
  onWishlist: () => void;
  wishlistCount?: number;
  activeFilterCount?: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseToolbox({
  onFilter,
  onSort,
  onWishlist,
  wishlistCount = 0,
  activeFilterCount = 0,
  s,
  t
}: DatabaseToolboxProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      <ToolboxButton
        icon="options-outline"
        label={databaseCopy.filter}
        badge={activeFilterCount > 0 ? String(activeFilterCount) : undefined}
        onPress={onFilter}
        styles={styles}
        s={s}
      />
      <ToolboxButton
        icon="swap-vertical-outline"
        label={databaseCopy.sort}
        onPress={onSort}
        styles={styles}
        s={s}
      />
      <ToolboxButton
        icon="heart-outline"
        label={databaseCopy.wishlist}
        badge={wishlistCount > 0 ? String(wishlistCount) : undefined}
        onPress={onWishlist}
        styles={styles}
        s={s}
      />
    </View>
  );
}

function ToolboxButton({
  icon,
  label,
  badge,
  onPress,
  styles,
  s
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  s: (n: number) => number;
}) {
  return (
    <Pressable style={styles.btn} onPress={onPress} accessibilityRole="button">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={s(20)} color={figmaColors.charcoal} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: s(10),
      marginBottom: s(16)
    },
    btn: {
      flex: 1,
      minHeight: s(56),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: s(8),
      gap: s(4)
    },
    iconWrap: { position: 'relative' },
    badge: {
      position: 'absolute',
      top: s(-6),
      right: s(-10),
      minWidth: s(18),
      height: s(18),
      borderRadius: s(9),
      backgroundColor: figmaColors.bronze,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(4)
    },
    badgeText: {
      fontFamily: appFonts.body,
      fontSize: tb(10),
      color: figmaColors.cream
    },
    btnText: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.charcoal,
      ...broadsheetAccent,
      letterSpacing: 0.6
    }
  });
}
