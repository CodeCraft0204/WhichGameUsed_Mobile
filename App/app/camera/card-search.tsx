import { useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cameraCopy } from '@/constants/cameraCopy';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseWishlistAddHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { searchCameraCardCatalog, type CameraCardSearchResult } from '@/lib/camera-card-catalog';

export default function CameraCardSearchScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<CameraCardSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void searchCameraCardCatalog(debouncedQuery).then(({ items, error: err }) => {
      if (!active) return;
      setResults(items);
      setError(err);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const handleSelect = (item: CameraCardSearchResult) => {
    router.replace({
      pathname: '/camera/camera',
      params: {
        linkedCardKey: item.key,
        linkedCardTitle: item.title
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button">
          <Text style={styles.cancel}>{cameraCopy.searchCancel}</Text>
        </Pressable>
        <Text style={styles.title}>{cameraCopy.searchTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={cameraCopy.searchPlaceholder}
        placeholderTextColor={figmaColors.textMuted}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} color={figmaColors.charcoal} />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>{cameraCopy.searchEmpty}</Text>
              <Pressable
                style={styles.requestBtn}
                onPress={() =>
                  router.push(
                    databaseWishlistAddHref({ query: debouncedQuery, returnTo: 'camera' })
                  )
                }
              >
                <Text style={styles.requestBtnText}>{databaseCopy.requestAddLink}</Text>
              </Pressable>
            </View>
          ) : null
        }
        ListFooterComponent={
          results.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.footerHint}>{databaseCopy.cardNotFound}</Text>
              <Pressable
                onPress={() =>
                  router.push(
                    databaseWishlistAddHref({ query: debouncedQuery, returnTo: 'camera' })
                  )
                }
              >
                <Text style={styles.requestLink}>{databaseCopy.requestAddLink}</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handleSelect(item)}>
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : item.cardImage}
              style={styles.thumb}
              resizeMode="cover"
            />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.rowDesc} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(16),
      paddingVertical: s(12)
    },
    cancel: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    title: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    headerSpacer: { width: s(56) },
    input: {
      marginHorizontal: s(16),
      marginBottom: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    loader: { marginVertical: s(12) },
    error: {
      marginHorizontal: s(16),
      marginBottom: s(8),
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      textAlign: 'center'
    },
    list: { paddingHorizontal: s(16), paddingBottom: s(24) },
    emptyWrap: { marginTop: s(24), gap: s(16), alignItems: 'center' },
    empty: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    requestBtn: {
      borderWidth: 1,
      borderColor: figmaColors.charcoal,
      borderRadius: s(10),
      paddingHorizontal: s(16),
      paddingVertical: s(12)
    },
    requestBtnText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    footer: {
      marginTop: s(20),
      paddingTop: s(16),
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      alignItems: 'center',
      gap: s(8)
    },
    footerHint: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    },
    requestLink: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.bronze
    },
    row: {
      flexDirection: 'row',
      gap: s(12),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    thumb: {
      width: s(56),
      height: s(72),
      borderRadius: s(6),
      backgroundColor: figmaColors.divider
    },
    rowText: { flex: 1, gap: s(4) },
    rowTitle: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    rowDesc: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(18),
      color: figmaColors.gray
    }
  });
}
