import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthenticateDraftCard } from '@/components/figma/AuthenticateRecordCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { ScanSubmitButton } from '@/components/figma/ScanSubmitButton';
import { authenticateIcons, authenticateTabs } from '@/constants/authenticateContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';
import { submissionDetailHref, databaseNotificationsHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { countUnreadNotifications } from '@/lib/notifications';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const loadedOnceRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!loadedOnceRef.current && liveSubmissions.length === 0) {
        setLoading(true);
      }
      setError(null);
      void listMySubmissionsWithItems().then(({ items, error }) => {
        if (!active) return;
        if (error) setError(error);
        else {
          setLiveSubmissions(items);
          loadedOnceRef.current = true;
        }
        setLoading(false);
      });
      void countUnreadNotifications().then((count) => {
        if (active) setUnreadCount(count);
      });
      return () => {
        active = false;
      };
    }, [liveSubmissions.length])
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
            s={s}
            page={page}
          />
          <View style={styles.stickyToolbar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[page.tabRow, styles.tabRow]}
            >
              {authenticateTabs.map((tab, index) => (
                <Pressable
                  key={tab}
                  style={[page.tabButton, index === activeTab && page.tabButtonActive]}
                  onPress={() => setActiveTab(index)}
                >
                  <Text style={[page.tabText, index === activeTab && page.tabTextActive]}>{tab}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={[page.scrollContent, styles.contentScrollBody]}
          showsVerticalScrollIndicator={false}
        >
          {unreadCount > 0 ? (
            <Pressable style={styles.noticeRow} onPress={() => router.push(databaseNotificationsHref())}>
              <Text style={styles.noticeText}>
                {unreadCount} new notification{unreadCount === 1 ? '' : 's'}
              </Text>
            </Pressable>
          ) : null}

          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>{activeSectionTitle}</Text>
            {!loading ? (
              <Text style={page.viewAllText}>{databaseCopy.resultsCount(activeList.length)}</Text>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator size="small" color={figmaColors.charcoal} />
              <Text style={styles.loadingText}>Loading submissions…</Text>
            </View>
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

          <ScanSubmitButton s={s} t={t} onPress={() => router.push('/create/create')} />

          <View style={styles.ctaCard}>
            <Image source={authenticateIcons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
            <View style={page.ctaTextWrap}>
              <Text style={styles.ctaTitle}>LET THE GAMES BEGIN.</Text>
              <Text style={styles.ctaBody}>
                Scan your cards, see the evidence, and submit for a FREE tamper-proof QR-linked label.
              </Text>
            </View>
            <Image source={authenticateIcons.sectionChevron} style={page.ctaArrow} resizeMode="contain" />
          </View>
        </ScrollView>
      </View>
    </FigmaScreen>
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
      paddingBottom: s(8),
      zIndex: 2
    },
    contentScroll: { flex: 1 },
    contentScrollBody: {
      paddingTop: s(8),
      paddingBottom: s(16)
    },
    tabRow: {
      flexWrap: 'nowrap',
      gap: s(14)
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
      fontSize: 17,
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: appFonts.body,
      fontSize: 18,
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
    sectionLoader: {
      paddingVertical: s(28),
      alignItems: 'center',
      gap: s(10),
      marginBottom: s(12)
    },
    loadingText: {
      fontFamily: appFonts.body,
      fontSize: 16,
      color: figmaColors.gray
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: 16,
      color: figmaColors.error,
      marginBottom: s(12)
    },
    noticeRow: {
      marginBottom: s(12),
      paddingVertical: s(10),
      paddingHorizontal: s(14),
      borderRadius: s(10),
      backgroundColor: figmaColors.successBg,
      borderWidth: 1,
      borderColor: figmaColors.success
    },
    noticeText: {
      fontFamily: appFonts.body,
      fontSize: 15,
      color: figmaColors.charcoal
    }
  });
}
