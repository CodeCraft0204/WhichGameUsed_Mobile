import { useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ContextGuidanceStrip } from '@/components/context-header/ContextGuidanceStrip';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { ScanSubmitButton } from '@/components/figma/ScanSubmitButton';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { createCopy } from '@/constants/createContent';
import { authenticateIcons } from '@/constants/authenticateContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useAuth } from '@/context/AuthContext';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { pickCardPhotoFromLibrary } from '@/lib/capture-photos';

export default function CreateScreen() {
  return (
    <ContextHeaderScrollProvider>
      <CreateScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function CreateScreenBody() {
  const router = useRouter();
  const { session } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  const openCamera = () => {
    router.push('/camera/camera');
  };

  const openLibraryThenEdit = async () => {
    const uri = await pickCardPhotoFromLibrary();
    if (!uri) return;
    router.push({
      pathname: '/create/edit',
      params: { frontUri: uri }
    });
  };

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="create" />}
      scrollProps={scrollProps}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={[page.title, styles.title]}>{createCopy.title}</Text>
        <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
        <Text style={[page.subtitle, styles.subtitle]}>{createCopy.subtitle}</Text>
        <ContextGuidanceStrip
          pageKey="create"
          style={[page.description, styles.description]}
          containerStyle={styles.descriptionWrap}
        />
        <Image source={authenticateIcons.hero} style={styles.hero} resizeMode="contain" />
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.step}>{createCopy.step1}</Text>
        <Text style={styles.step}>{createCopy.step2}</Text>
        <Text style={styles.step}>{createCopy.step3}</Text>
      </View>

      {session ? (
        <>
          <ScanSubmitButton
            label={createCopy.openEditor}
            onPress={() => router.push('/create/templates')}
            s={s}
            t={t}
          />
          <ScanSubmitButton onPress={openCamera} s={s} t={t} />
          <Pressable onPress={() => void openLibraryThenEdit()} style={styles.libraryLink}>
            <Text style={styles.libraryText}>{createCopy.chooseLibrary}</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.signInCard}>
          <Text style={styles.signInText}>{createCopy.signInRequired}</Text>
          <AuthPrimaryButton
            label="SIGN IN"
            onPress={() => router.replace('/sign-in/sign-in')}
          />
        </View>
      )}
    </FigmaScreen>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    headerSection: { alignItems: 'center' },
    title: { textAlign: 'center' },
    titleBrush: {
      width: s(220),
      height: s(28),
      marginTop: s(6),
      marginBottom: s(12)
    },
    subtitle: {
      textAlign: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(4)
    },
    descriptionWrap: {
      width: '100%',
      marginTop: 0
    },
    description: {
      textAlign: 'center',
      paddingHorizontal: s(12),
      marginTop: 0
    },
    hero: {
      width: s(500),
      height: s(350),
      marginBottom: s(8)
    },
    stepsCard: {
      gap: s(10),
      padding: s(18),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.inputBg,
      marginBottom: s(8)
    },
    step: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    libraryLink: {
      alignItems: 'center',
      paddingVertical: s(12)
    },
    libraryText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.accent,
      textDecorationLine: 'underline'
    },
    signInCard: {
      gap: s(14),
      padding: s(18),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.ctaBackground
    },
    signInText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
