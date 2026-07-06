import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  displayName: string;
  avatarUrl: string | null;
  subtitle?: string | null;
  s: (n: number) => number;
  t: (n: number) => number;
  onBack: () => void;
  onPressProfile?: () => void;
  onPressMenu?: () => void;
};

export function ChatConversationHeader({
  displayName,
  avatarUrl,
  subtitle,
  s,
  t,
  onBack,
  onPressProfile,
  onPressMenu
}: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Back">
        <Ionicons name="arrow-back" size={s(24)} color={figmaColors.charcoal} />
      </Pressable>

      <Pressable
        style={styles.identity}
        onPress={onPressProfile}
        disabled={!onPressProfile}
        accessibilityRole="button"
      >
        <ProfileAvatar url={avatarUrl} name={displayName} size={s(42)} />
        <View style={styles.textCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Ionicons name="shield-checkmark" size={s(14)} color={figmaColors.navActive} />
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onPressMenu}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Conversation options"
      >
        <Ionicons name="ellipsis-vertical" size={s(20)} color={figmaColors.charcoal} />
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      backgroundColor: figmaColors.parchment,
      paddingHorizontal: s(8),
      paddingVertical: s(10)
    },
    iconBtn: {
      width: s(40),
      height: s(40),
      alignItems: 'center',
      justifyContent: 'center'
    },
    identity: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      minWidth: 0
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      gap: s(2)
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    name: {
      flexShrink: 1,
      fontFamily: appFonts.bodyBold,
      fontSize: tb(18),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    }
  });
}
