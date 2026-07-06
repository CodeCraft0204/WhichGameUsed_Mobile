import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaSharedIcons } from '@/constants/figmaShared';

type FigmaUtilityBarProps = {
  s: (n: number) => number;
  showMessages?: boolean;
  messagesUnreadCount?: number;
  onPressMessages?: () => void;
};

export function FigmaUtilityBar({
  s,
  showMessages = false,
  messagesUnreadCount = 0,
  onPressMessages
}: FigmaUtilityBarProps) {
  const router = useRouter();
  const itemCount = showMessages ? 4 : 3;
  const styles = useMemo(() => createStyles(s, itemCount), [itemCount, s]);
  const messageIcon =
    messagesUnreadCount > 0 ? figmaIcons.msgIconBadge : figmaIcons.msgIcon;

  return (
    <View style={styles.utilityBar}>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Image source={figmaSharedIcons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>

      {showMessages ? (
        <Pressable
          style={styles.utilityBtn}
          accessibilityRole="button"
          accessibilityLabel={
            messagesUnreadCount > 0
              ? `Messages, ${messagesUnreadCount} unread`
              : 'Messages'
          }
          onPress={onPressMessages}
        >
          <Image source={messageIcon} style={styles.utilityIcon} resizeMode="contain" />
        </Pressable>
      ) : null}

      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push('/profile/profile')}
      >
        <Image source={figmaSharedIcons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={() => router.push('/settings/settings')}
      >
        <Image source={figmaSharedIcons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, itemCount: number) {
  const barHeight = s(itemCount === 4 ? 328 : 263);

  return StyleSheet.create({
    utilityBar: {
      position: 'absolute',
      right: 0,
      top: s(28),
      width: s(84),
      height: barHeight,
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.utilityBar,
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    utilityBtn: {
      padding: s(4)
    },
    utilityIcon: {
      width: s(40),
      height: s(40)
    }
  });
}
