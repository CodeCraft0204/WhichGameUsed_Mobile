import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthSubpageShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/** Scrollable auth-adjacent screen (legal, support) with back navigation. */
export function AuthSubpageShell({ title, subtitle, children, footer }: AuthSubpageShellProps) {
  const router = useRouter();
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={s(22)} color={figmaColors.charcoal} />
            </Pressable>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: figmaColors.background
    },
    flex: {
      flex: 1
    },
    header: {
      paddingHorizontal: s(20),
      paddingTop: s(8),
      paddingBottom: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      gap: s(6)
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10)
    },
    backBtn: {
      width: s(36),
      height: s(36),
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    title: {
      flex: 1,
      flexShrink: 1,
      fontFamily: appFonts.display,
      fontSize: t(24),
      lineHeight: t(30),
      color: figmaColors.black,
      letterSpacing: 0.5
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      paddingLeft: s(46)
    },
    scroll: {
      paddingHorizontal: s(20),
      paddingTop: s(20),
      paddingBottom: s(32),
      gap: s(16)
    },
    footer: {
      paddingHorizontal: s(20),
      paddingTop: s(12),
      paddingBottom: s(16),
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      backgroundColor: figmaColors.background
    }
  });
}
