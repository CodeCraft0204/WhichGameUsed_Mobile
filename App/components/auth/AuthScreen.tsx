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
import { authIcons } from '@/constants/authContent';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthScreenProps = {
  hero?: ImageSourcePropType;
  title: string;
  subtitle: string;
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

          <Text style={styles.title}>{title}</Text>
          <Image source={authIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
          <Text style={styles.subtitle}>{subtitle}</Text>

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
      backgroundColor: '#E8E0D6'
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
    hero: {
      width: '100%',
      height: s(authLayout.heroHeight * 1.5),
      marginBottom: s(12)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(authLayout.titleSize),
      lineHeight: t(authLayout.titleLineHeight),
      color: figmaColors.black,
      textAlign: 'center',
      letterSpacing: 0.6
    },
    titleBrush: {
      width: s(authLayout.titleBrushWidth),
      height: s(authLayout.titleBrushHeight),
      alignSelf: 'center',
      marginTop: s(8),
      marginBottom: s(14)
    },
    subtitle: {
      fontFamily: 'EBGaramond_400Regular',
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
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(authLayout.footerNoteSize),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    footerOuter: {
      backgroundColor: '#E8E0D6'
    },
    tornEdge: {
      width: '100%',
      height: s(20),
      tintColor: '#E8E0D6'
    },
    footerBand: {
      paddingHorizontal: s(24),
      paddingTop: s(14),
      paddingBottom: s(22),
      backgroundColor: '#E8E0D6'
    }
  });
}
