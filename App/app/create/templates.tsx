import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { appFonts } from '@/constants/appFonts';
import { editorCopy } from '@/constants/createContent';
import { photoFrames } from '@/constants/photoEditorAssets';
import { photoEditorTemplates } from '@/constants/photoEditorTemplates';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export default function CreateTemplatesScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="create" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <Pressable onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.backText}>{editorCopy.back}</Text>
      </Pressable>

      <Text style={[page.sectionTitle, styles.heading]}>{editorCopy.pickTemplate}</Text>
      <Text style={styles.lead}>{editorCopy.pickTemplateLead}</Text>

      <View style={styles.grid}>
        {photoEditorTemplates.map((tpl) => (
          <Pressable
            key={tpl.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/create/editor',
                params: { templateId: tpl.id }
              })
            }
          >
            <Image source={photoFrames[tpl.previewFrame]} style={styles.preview} resizeMode="contain" />
            <Text style={styles.cardTitle}>{tpl.name}</Text>
            <Text style={styles.cardBody} numberOfLines={2}>
              {tpl.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </FigmaScreen>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    backRow: { marginBottom: s(8) },
    backText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    heading: { marginTop: s(4) },
    lead: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    grid: { gap: s(14) },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14),
      backgroundColor: figmaColors.inputBg
    },
    preview: {
      width: '100%',
      height: s(120),
      marginBottom: s(10)
    },
    cardTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    cardBody: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    }
  });
}
