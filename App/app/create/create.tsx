import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { pickCardPhotoFromLibrary } from '@/lib/capture-photos';

export default function CreateScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

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
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={[page.title, styles.title]}>{createCopy.title}</Text>
        <Image source={figmaSharedIcons.titleBrush} style={styles.titleBrush} resizeMode="stretch" />
        <Text style={[page.subtitle, styles.subtitle]}>{createCopy.subtitle}</Text>
        <Image source={authenticateIcons.hero} style={styles.hero} resizeMode="contain" />
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.step}>{createCopy.step1}</Text>
        <Text style={styles.step}>{createCopy.step2}</Text>
        <Text style={styles.step}>{createCopy.step3}</Text>
      </View>

      {session ? (
        <>
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
      marginBottom: s(8)
    },
    hero: {
      width: s(200),
      height: s(120),
      marginBottom: s(8)
    },
    stepsCard: {
      gap: s(10),
      padding: s(18),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: '#FFFFFF',
      marginBottom: s(8)
    },
    step: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    libraryLink: {
      alignItems: 'center',
      paddingVertical: s(12)
    },
    libraryText: {
      fontFamily: 'EBGaramond_700Bold',
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
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
