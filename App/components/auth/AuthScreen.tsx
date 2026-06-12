import React, { useMemo } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import { authIcons } from '@/constants/authContent';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthScreenProps = {
  hero?: ImageSourcePropType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerLeading?: React.ReactNode;
  footerBand?: React.ReactNode;
  footerNote?: string;
};

export function AuthScreen({
  hero,
  title,
  subtitle,
  children,
  headerLeading,
  footerBand,
  footerNote
}: AuthScreenProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {headerLeading}

          {hero ? (
            <Image source={hero} style={styles.hero} resizeMode="contain" accessibilityIgnoresInvertColors />
          ) : null}

          <Image
            source={authIcons.logo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Which Game Used"
          />
          {/* <Text style={styles.title}>{title}</Text> */}
          <Image source={authIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <View style={styles.form}>{children}</View>

          {footerNote ? (
            <View style={styles.noteRow}>
              <Text style={styles.footerNote}>{footerNote}</Text>
            </View>
          ) : null}
        </ScrollView>

        {footerBand ? (
          <View style={styles.footerOuter}>
            <Image source={authIcons.tornEdge} style={styles.tornEdge} resizeMode="stretch" />
            <View style={styles.footerBand}>{footerBand}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
      <SafeAreaView edges={['bottom']} style={styles.safeBottom} />
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    safeBottom: {
      backgroundColor: figmaColors.stone
    },
    flex: {
      flex: 1
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: s(24),
      paddingTop: s(8),
      paddingBottom: s(28)
    },
    logo: {
      width: s(authLayout.logoWidth * 1.5),
      height: s(authLayout.logoHeight * 1.5),
      alignSelf: 'center',
    },
    hero: {
      width: '100%',
      height: s(authLayout.heroHeight * 1.3),
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(authLayout.titleSize),
      lineHeight: t(authLayout.titleLineHeight),
      color: figmaColors.textPrimary,
      textAlign: 'center',
      letterSpacing: 1.2,
      textTransform: 'uppercase'
    },
    titleBrush: {
      width: s(authLayout.titleBrushWidth * 1.2),
      height: s(authLayout.titleBrushHeight),
      alignSelf: 'center',
      marginTop: s(8),
      marginBottom: s(14)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(authLayout.subtitleSize),
      lineHeight: t(authLayout.subtitleLineHeight),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(26),
      paddingHorizontal: s(8)
    },
    form: {
      gap: s(16)
    },
    noteRow: {
      marginTop: s(22),
      paddingHorizontal: s(8)
    },
    footerNote: {
      fontFamily: appFonts.body,
      fontSize: t(authLayout.footerNoteSize),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    footerOuter: {
      backgroundColor: figmaColors.stone
    },
    tornEdge: {
      width: '100%',
      height: s(20),
      tintColor: figmaColors.stone
    },
    footerBand: {
      paddingHorizontal: s(24),
      paddingTop: s(14),
      paddingBottom: s(22),
      backgroundColor: figmaColors.stone
    }
  });
}
