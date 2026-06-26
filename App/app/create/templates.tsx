import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { appFonts } from '@/constants/appFonts';
import { editorCopy } from '@/constants/createContent';
import { photoFrames, photoAssetPreviewBackground, photoAssetPreviewBorder } from '@/constants/photoEditorAssets';
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

      <View style={styles.list}>
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
            <View style={styles.thumbWrap}>
              <Image source={photoFrames[tpl.previewFrame]} style={styles.preview} resizeMode="contain" />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{tpl.name}</Text>
              <Text style={styles.cardBody} numberOfLines={3}>
                {tpl.description}
              </Text>
            </View>
          </Pressable>
        ))}

        <Pressable
          style={[styles.card, styles.blankCard]}
          onPress={() => router.push('/create/blank-editor')}
        >
          <View style={[styles.thumbWrap, styles.blankThumb]}>
            <Ionicons name="color-wand" size={t(30)} color={figmaColors.accentStrong} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{editorCopy.startFromBlank}</Text>
            <Text style={styles.cardBody} numberOfLines={3}>
              {editorCopy.startFromBlankLead}
            </Text>
          </View>
        </Pressable>
      </View>
    </FigmaScreen>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const thumbSize = s(72);

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
    list: { gap: s(10) },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingVertical: s(10),
      paddingHorizontal: s(12),
      backgroundColor: figmaColors.inputBg,
      minHeight: thumbSize + s(20)
    },
    blankCard: {
      borderColor: figmaColors.border,
      borderStyle: 'dashed'
    },
    thumbWrap: {
      width: thumbSize,
      height: thumbSize,
      borderRadius: s(8),
      backgroundColor: photoAssetPreviewBackground,
      borderWidth: 1,
      borderColor: photoAssetPreviewBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    blankThumb: {
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    preview: {
      width: '88%',
      height: '88%'
    },
    cardCopy: {
      flex: 1,
      justifyContent: 'center'
    },
    cardTitle: {
      fontFamily: appFonts.display,
      fontSize: t(17),
      color: figmaColors.charcoal,
      marginBottom: s(3)
    },
    cardBody: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray
    }
  });
}
