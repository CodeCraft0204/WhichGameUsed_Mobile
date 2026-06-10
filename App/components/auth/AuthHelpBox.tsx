import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { authIcons } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthHelpBoxProps = {
  title: string;
  body: string;
  linkPrefix: string;
  linkLabel: string;
  onLinkPress?: () => void;
};

/** "Trouble with your email?" card with envelope + shield illustration. */
export function AuthHelpBox({
  title,
  body,
  linkPrefix,
  linkLabel,
  onLinkPress
}: AuthHelpBoxProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.box}>
      <Image
        source={authIcons.resetPasswordInfoIllustration}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <View style={styles.linkRow}>
          <Text style={styles.linkPrefix}>{linkPrefix}</Text>
          <Pressable
            onPress={onLinkPress}
            disabled={!onLinkPress}
            hitSlop={8}
            accessibilityRole="link"
            style={styles.linkPressable}
          >
            <Text style={[styles.link, !onLinkPress && styles.linkDisabled]}>{linkLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    box: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
      padding: s(16),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      backgroundColor: figmaColors.inputBg,
      marginTop: s(8)
    },
    illustration: {
      width: s(88),
      height: s(88),
      marginTop: s(2)
    },
    content: {
      flex: 1,
      gap: s(6)
    },
    title: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(19),
      lineHeight: t(26),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    linkRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    linkPrefix: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    linkPressable: {
      justifyContent: 'center'
    },
    link: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    },
    linkDisabled: {
      textDecorationLine: 'none'
    }
  });
}
