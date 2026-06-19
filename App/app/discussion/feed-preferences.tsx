import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  clearAllForumFeedFilters,
  listForumFeedFilters,
  removeForumFeedFilter,
  type ForumFeedFilterRow
} from '@/lib/forum';

export default function DiscussionFeedPreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<ForumFeedFilterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!user) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const { items: rows, error: err } = await listForumFeedFilters();
      if (err) setError(err);
      else setItems(rows);

      setLoading(false);
      setRefreshing(false);
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function handleRemove(filter: ForumFeedFilterRow) {
    setBusyId(filter.id);
    const { error: err } = await removeForumFeedFilter(filter.id);
    setBusyId(null);
    if (err) {
      Alert.alert('Could not update', err);
      return;
    }
    setItems((prev) => prev.filter((row) => row.id !== filter.id));
  }

  function handleClearAll() {
    Alert.alert(
      'Show everything again?',
      'This removes all threads, topics, and authors you hid with “Show less”. Your feed will include them again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore all',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setClearingAll(true);
              const { error: err } = await clearAllForumFeedFilters();
              setClearingAll(false);
              if (err) {
                Alert.alert('Could not restore feed', err);
                return;
              }
              setItems([]);
              Alert.alert('Feed restored', 'Hidden threads and topics can appear in your feed again.');
            })();
          }
        }
      ]
    );
  }

  if (!user) {
    return (
      <FigmaScreen
        backgroundColor={figmaColors.background}
        bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
        scrollProps={{ contentContainerStyle: page.scrollContent }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.signInCard}>
          <Text style={styles.signInTitle}>Feed preferences</Text>
          <Text style={styles.signInBody}>
            Sign in to manage threads and topics you hid with “Show less”.
          </Text>
          <AuthPrimaryButton label="Sign in" onPress={() => router.push('/sign-in/sign-in')} />
        </View>
      </FigmaScreen>
    );
  }

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="discussion" />}
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
      }}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Hidden from feed</Text>
      <Text style={styles.subtitle}>
        Content you marked with “Show less”. Remove individual items or restore everything at once.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && items.length === 0 ? (
        <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} />
      ) : items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing hidden</Text>
          <Text style={styles.emptyBody}>
            When you choose “Show less” on a thread, it will appear here so you can bring it back.
          </Text>
        </View>
      ) : (
        <>
          {items.map((filter) => (
            <View key={filter.id} style={styles.filterRow}>
              <View style={styles.filterText}>
                <Text style={styles.filterType}>{filter.subtitle}</Text>
                <Text style={styles.filterLabel} numberOfLines={2}>
                  {filter.label}
                </Text>
                <Text style={styles.filterMeta}>
                  Hidden {new Date(filter.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Pressable
                style={styles.showAgainBtn}
                onPress={() => void handleRemove(filter)}
                disabled={busyId === filter.id || clearingAll}
              >
                {busyId === filter.id ? (
                  <ActivityIndicator color={figmaColors.charcoal} size="small" />
                ) : (
                  <Text style={styles.showAgainText}>Show again</Text>
                )}
              </Pressable>
            </View>
          ))}

          <Pressable
            style={[styles.restoreAllBtn, clearingAll && styles.restoreAllBtnDisabled]}
            onPress={handleClearAll}
            disabled={clearingAll}
          >
            {clearingAll ? (
              <ActivityIndicator color={figmaColors.buttonPrimaryText} />
            ) : (
              <Text style={styles.restoreAllText}>Show everything again</Text>
            )}
          </Pressable>
        </>
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    backText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    loader: {
      marginVertical: s(24)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    emptyCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(20)
    },
    emptyTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    emptyBody: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(12),
      marginBottom: s(8)
    },
    filterText: {
      flex: 1,
      minWidth: 0
    },
    filterType: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      color: figmaColors.gray,
      marginBottom: s(2)
    },
    filterLabel: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    filterMeta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      marginTop: s(4)
    },
    showAgainBtn: {
      minWidth: s(88),
      height: s(36),
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(10)
    },
    showAgainText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.charcoal
    },
    restoreAllBtn: {
      height: s(46),
      borderRadius: s(23),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(12)
    },
    restoreAllBtnDisabled: {
      opacity: 0.6
    },
    restoreAllText: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      color: figmaColors.buttonPrimaryText
    },
    signInCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.cardFeaturedBg,
      padding: s(24),
      alignItems: 'center',
      marginTop: s(20)
    },
    signInTitle: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    signInBody: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(18)
    }
  });
}
