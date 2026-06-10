import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { authIcons, passwordRequirements } from '@/constants/authContent';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthPasswordRequirementsProps = {
  password: string;
  title: string;
};

/** "Password must contain:" card with live checklist + lock illustration from design assets. */
export function AuthPasswordRequirements({ password, title }: AuthPasswordRequirementsProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.box}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={s(35)} color={figmaColors.accent} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {passwordRequirements.map((rule) => {
          const met = rule.test(password);
          return (
            <View key={rule.id} style={styles.row}>
              <View style={[styles.bullet, met && styles.bulletMet]}>
                {met ? <Ionicons name="checkmark" size={s(10)} color={figmaColors.textOnDark} /> : null}
              </View>
              <Text style={[styles.rule, met && styles.ruleMet]}>{rule.label}</Text>
            </View>
          );
        })}
      </View>

      <Image
        source={authIcons.setNewPasswordInfoIllustration}
        style={styles.illustration}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    box: {
      position: 'relative',
      padding: s(16),
      paddingRight: s(108),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      backgroundColor: figmaColors.ctaBackground,
      marginTop: s(8),
      overflow: 'hidden',
      minHeight: s(168)
    },
    content: {
      flex: 1,
      gap: s(8),
      zIndex: 1
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(4)
    },
    title: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      flex: 1
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10)
    },
    bullet: {
      marginLeft: s(30),
      width: s(18),
      height: s(18),
      borderRadius: s(9),
      borderWidth: 1,
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.inputBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    bulletMet: {
      backgroundColor: figmaColors.accent,
      borderColor: figmaColors.accent
    },
    rule: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      flex: 1
    },
    ruleMet: {
      fontFamily: 'Inter_700Bold',
      color: figmaColors.charcoal
    },
    illustration: {
      position: 'absolute',
      right: s(30),
      bottom: s(0),
      width: s(230),
      height: s(250),
      opacity: 0.95
    }
  });
}
