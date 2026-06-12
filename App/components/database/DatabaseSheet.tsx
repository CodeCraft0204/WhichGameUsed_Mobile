import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { catalogSortOptions } from '@/constants/databaseFilters';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import type { CatalogSort } from '@/lib/cards';

type DatabaseFilterSheetProps = {
  visible: boolean;
  authenticatedOnly: boolean;
  memorabiliaType: string;
  onAuthenticatedOnlyChange: (v: boolean) => void;
  onMemorabiliaTypeChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseFilterSheet({
  visible,
  authenticatedOnly,
  memorabiliaType,
  onAuthenticatedOnlyChange,
  onMemorabiliaTypeChange,
  onApply,
  onClear,
  onClose,
  s,
  t
}: DatabaseFilterSheetProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <Text style={styles.title}>{databaseCopy.filterTitle}</Text>

        <Pressable
          style={[styles.toggleRow, authenticatedOnly && styles.toggleRowActive]}
          onPress={() => onAuthenticatedOnlyChange(!authenticatedOnly)}
        >
          <Text style={styles.toggleLabel}>{databaseCopy.authenticatedOnly}</Text>
          <View style={[styles.checkbox, authenticatedOnly && styles.checkboxOn]} />
        </Pressable>

        <Text style={styles.fieldLabel}>{databaseCopy.memorabiliaType}</Text>
        <TextInput
          style={styles.input}
          value={memorabiliaType}
          onChangeText={onMemorabiliaTypeChange}
          placeholder={databaseCopy.memorabiliaPlaceholder}
          placeholderTextColor={figmaColors.textMuted}
        />

        <View style={styles.actions}>
          <Pressable onPress={onClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>{databaseCopy.clearFilters}</Text>
          </Pressable>
          <AuthPrimaryButton label={databaseCopy.applyFilters} onPress={onApply} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

type DatabaseSortSheetProps = {
  visible: boolean;
  value: CatalogSort;
  onChange: (sort: CatalogSort) => void;
  onClose: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseSortSheet({
  visible,
  value,
  onChange,
  onClose,
  s,
  t
}: DatabaseSortSheetProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <Text style={styles.title}>{databaseCopy.sortTitle}</Text>
        <ScrollView>
          {catalogSortOptions.map((opt) => {
            const active = opt.key === value;
            return (
              <Pressable
                key={opt.key}
                style={[styles.sortRow, active && styles.sortRowActive]}
                onPress={() => {
                  onChange(opt.key);
                  onClose();
                }}
              >
                <Text style={[styles.sortText, active && styles.sortTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(61, 52, 41, 0.45)'
    },
    sheet: {
      backgroundColor: figmaColors.background,
      borderTopLeftRadius: s(20),
      borderTopRightRadius: s(20),
      paddingHorizontal: s(20),
      paddingTop: s(12),
      paddingBottom: s(24),
      maxHeight: '70%'
    },
    handle: {
      alignSelf: 'center',
      width: s(40),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: figmaColors.divider,
      marginBottom: s(16)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      color: figmaColors.charcoal,
      marginBottom: s(16)
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(16),
      backgroundColor: figmaColors.cream
    },
    toggleRowActive: {
      borderColor: figmaColors.charcoal,
      backgroundColor: figmaColors.surfaceHighlight
    },
    toggleLabel: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.charcoal
    },
    checkbox: {
      width: s(22),
      height: s(22),
      borderRadius: s(6),
      borderWidth: 2,
      borderColor: figmaColors.border
    },
    checkboxOn: {
      backgroundColor: figmaColors.charcoal,
      borderColor: figmaColors.charcoal
    },
    fieldLabel: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream,
      marginBottom: s(20)
    },
    actions: { gap: s(12) },
    clearBtn: { alignItems: 'center', paddingVertical: s(8) },
    clearText: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.bronze
    },
    sortRow: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(10),
      backgroundColor: figmaColors.cream
    },
    sortRowActive: {
      borderColor: figmaColors.charcoal,
      backgroundColor: figmaColors.surfaceHighlight
    },
    sortText: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.gray
    },
    sortTextActive: { color: figmaColors.charcoal }
  });
}
