import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type CardDetailTopBarProps = {
  onBack: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  bookmarked?: boolean;
  bookmarkBusy?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CardDetailTopBar({
  onBack,
  onShare,
  onBookmark,
  bookmarked = false,
  bookmarkBusy = false,
  s,
  t
}: CardDetailTopBarProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.bar}>
      <Pressable
        style={styles.backBtn}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={s(22)} color={figmaColors.charcoal} />
      </Pressable>

      <View style={styles.actions}>
        {onShare ? (
          <Pressable
            style={styles.iconBtn}
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel="Share card"
          >
            <Ionicons name="share-outline" size={s(22)} color={figmaColors.charcoal} />
          </Pressable>
        ) : null}
        {onBookmark ? (
          <Pressable
            style={styles.iconBtn}
            onPress={onBookmark}
            disabled={bookmarkBusy}
            accessibilityRole="button"
            accessibilityLabel={bookmarked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            {bookmarkBusy ? (
              <ActivityIndicator size="small" color={figmaColors.bronze} />
            ) : (
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={s(22)}
                color={bookmarked ? figmaColors.bronze : figmaColors.charcoal}
              />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(16),
      paddingVertical: s(4)
    },
    backBtn: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    iconBtn: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
