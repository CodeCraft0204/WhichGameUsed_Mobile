import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AuthenticateDraftCard } from '@/components/figma/AuthenticateRecordCard';
import { ContextScrollView } from '@/components/context-header/ContextScrollView';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaContentLoading } from '@/components/figma/FigmaContentLoading';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { ContextHeaderScrollProvider } from '@/context/ContextHeaderScrollContext';
import { ScanSubmitButton } from '@/components/figma/ScanSubmitButton';
import { authenticateIcons, authenticateTabs } from '@/constants/authenticateContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';
import { submissionDetailHref, databaseVerifyHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  linkedCardTitleFromItems,
  listMySubmissionsWithItems,
  statusLabel,
  type SubmissionWithItems
} from '@/lib/submissions';

export default function AuthenticateScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState(0);
  const [liveSubmissions, setLiveSubmissions] = useState<SubmissionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);

  const reload = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!loadedOnceRef.current && liveSubmissions.length === 0) setLoading(true);
    setError(null);

    const { items, error: listError } = await listMySubmissionsWithItems();

    if (listError) setError(listError);
    else {
      setLiveSubmissions(items);
      loadedOnceRef.current = true;
    }
    setLoading(false);
    setRefreshing(false);
  }, [liveSubmissions.length]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const pending = liveSubmissions.filter(
    (submission) => submission.status === 'draft'
  );
  const inProgress = liveSubmissions.filter(
    (submission) =>
      submission.status === 'pending_admin_review' ||
      submission.status === 'needs_more_info' ||
      submission.status === 'pending_payment'
  );
  const completed = liveSubmissions.filter(
    (submission) =>
      submission.status === 'approved' ||
      submission.status === 'rejected' ||
      submission.status === 'completed' ||
      submission.status === 'cancelled'
  );

  const activeList = activeTab === 0 ? pending : activeTab === 1 ? inProgress : completed;
  const activeSectionTitle =
    activeTab === 0 ? 'YOUR SUBMISSIONS' : activeTab === 1 ? 'IN PROGRESS' : 'REVIEWED';
  const activeEmptyCopy =
    activeTab === 0
      ? databaseCopy.submissionEmptyPending
      : activeTab === 1
        ? 'No submissions in progress right now.'
        : databaseCopy.submissionEmptyReviewed;

  return (
    <ContextHeaderScrollProvider>
      <FigmaScreen
        backgroundColor={figmaColors.background}
        bottomNav={<FigmaDatabaseBottomNav active="authenticate" />}
        scrollable={false}
      >
        <View style={styles.page}>
          <View style={[page.scrollContent, styles.fixedTop]}>
            <FigmaPageHeader
              title="AUTHENTICATE"
              subtitle="SUBMIT YOUR CARDS WITHOUT SUBMITTING YOUR CARDS."
              description="Scan your collection of game-used cards. If your card has been authenticated in our database, simply submit for authentication and we will mail you a tamper-proof QR-linked label for FREE."
              heroSource={authenticateIcons.main}
              guidanceKey="authenticate"
              s={s}
              page={page}
            />
          <View style={styles.stickyToolbar}>
            <FigmaChipRow
              options={chipOptionsFromLabels(authenticateTabs)}
              value={authenticateTabs[activeTab]}
              onChange={(tab) => setActiveTab(authenticateTabs.indexOf(tab))}
              s={s}
              t={t}
              style={styles.chipRow}
            />
          </View>
        </View>

        <ContextScrollView
          style={styles.contentScroll}
          contentContainerStyle={[page.scrollContent, styles.contentScrollBody]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void reload(true)} />
          }
        >
          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>{activeSectionTitle}</Text>
            {!loading ? (
              <Text style={page.viewAllText}>{databaseCopy.resultsCount(activeList.length)}</Text>
            ) : null}
          </View>

          {loading ? (
            <FigmaContentLoading message="Loading submissions…" s={s} t={t} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : activeList.length > 0 ? (
            activeList.map((row, idx) => {
              const linkedTitle = linkedCardTitleFromItems(row.items);
              return (
                <AuthenticateDraftCard
                  key={row.id}
                  cardImage={idx % 2 === 0 ? databaseIcons.recordMantle : databaseIcons.recordJordan}
                  imageUrl={row.preview_image_url}
                  title={linkedTitle ? linkedTitle : `Card submission`}
                  description={row.user_notes?.trim() || 'Submitted from mobile capture.'}
                  tags={['MOBILE', statusLabel(row.status).toUpperCase()]}
                  meta={[
                    {
                      key: 'status',
                      icon: 'clock',
                      label: statusLabel(row.status),
                      accent: row.status === 'approved' || row.status === 'completed'
                    },
                    {
                      key: 'date',
                      icon: 'calendar',
                      label: row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : 'Draft'
                    }
                  ]}
                  s={s}
                  t={t}
                  onPress={() => router.push(submissionDetailHref(row.id))}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>{activeEmptyCopy}</Text>
          )}

          <View style={styles.ctaAnchor}>
            <ScanSubmitButton s={s} t={t} onPress={() => router.push('/create/create')} />
            <ScanSubmitButton
              label="VERIFY A STICKER"
              s={s}
              t={t}
              onPress={() => router.push(databaseVerifyHref())}
            />

            <View style={styles.ctaCard}>
              <Image source={authenticateIcons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
              <View style={page.ctaTextWrap}>
                <Text style={styles.ctaTitle}>LET THE GAMES BEGIN.</Text>
                <Text style={styles.ctaBody}>
                  Scan your cards, see the evidence, and submit for a FREE tamper-proof QR-linked label.
                </Text>
              </View>
              <Image
                source={authenticateIcons.sectionChevron}
                style={page.ctaArrow}
                resizeMode="contain"
              />
            </View>
          </View>
        </ContextScrollView>
        </View>
      </FigmaScreen>
    </ContextHeaderScrollProvider>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    page: { flex: 1 },
    fixedTop: {
      paddingBottom: 0
    },
    stickyToolbar: {
      backgroundColor: figmaColors.background,
      paddingTop: s(15),
      zIndex: 2
    },
    contentScroll: { flex: 1 },
    contentScrollBody: {
      flexGrow: 1,
      paddingTop: s(8),
      paddingBottom: s(16)
    },
    chipRow: {
      marginVertical: 0
    },
    ctaAnchor: {
      marginTop: 'auto' as const,
      gap: s(12)
    },
    ctaCard: {
      minHeight: s(108),
      borderRadius: s(12),
      backgroundColor: figmaColors.ctaBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(10)
    },
    ctaTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: appFonts.body,
      fontSize: t(21),
      lineHeight: 20,
      color: figmaColors.gray
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: 16,
      lineHeight: 22,
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: 16,
      color: figmaColors.error,
      marginBottom: s(12)
    }
  });
}
