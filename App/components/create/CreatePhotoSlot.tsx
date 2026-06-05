import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type CreatePhotoSlotProps = {
  label: string;
  uri: string | null;
  required?: boolean;
  onRetake: () => void;
  onCrop: () => void;
};

export function CreatePhotoSlot({ label, uri, required, onRetake, onCrop }: CreatePhotoSlotProps) {
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={s(36)} color={figmaColors.gray} />
          <Text style={styles.placeholderText}>No photo</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={onRetake} accessibilityRole="button">
          <Ionicons name="camera-outline" size={s(16)} color={figmaColors.charcoal} />
          <Text style={styles.actionText}>Retake</Text>
        </Pressable>
        {uri ? (
          <Pressable style={styles.actionBtn} onPress={onCrop} accessibilityRole="button">
            <Ionicons name="crop-outline" size={s(16)} color={figmaColors.charcoal} />
            <Text style={styles.actionText}>Crop</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { gap: s(8) },
    label: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    required: { color: figmaColors.accent },
    image: {
      width: '100%',
      aspectRatio: 0.72,
      borderRadius: s(10),
      backgroundColor: '#ddd'
    },
    placeholder: {
      width: '100%',
      aspectRatio: 0.72,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.ctaBackground,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6)
    },
    placeholderText: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(13),
      color: figmaColors.gray
    },
    actions: {
      flexDirection: 'row',
      gap: s(12)
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      paddingVertical: s(4),
      paddingHorizontal: s(8)
    },
    actionText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(15),
      color: figmaColors.accent
    }
  });
}
