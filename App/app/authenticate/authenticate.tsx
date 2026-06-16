import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthenticateDraftCard, AuthenticateScannedCard } from '@/components/figma/AuthenticateRecordCard';
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
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void listMySubmissionsWithItems().then(({ items, error }) => {
        if (active && !error) setLiveSubmissions(items);
      });
      void countUnreadNotifications().then((count) => {
        if (active) setUnreadCount(count);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const pending = liveSubmissions.filter(
    (s) => s.status === 'draft' || s.status === 'pending_admin_review' || s.status === 'needs_more_info'
  );
  const completed = liveSubmissions.filter(
    (s) => s.status === 'approved' || s.status === 'rejected' || s.status === 'completed'
  );

  const showPending = activeTab !== 2;
  const showCompleted = activeTab !== 1;

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="authenticate" />}
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <FigmaPageHeader
        title="AUTHENTICATE"
        subtitle="SUBMIT YOUR CARDS WITHOUT SUBMITTING YOUR CARDS."
        description="Scan your collection of game-used cards. If your card has been authenticated in our database, simply submit for authentication and we will mail you a tamper-proof QR-linked label for FREE."
        heroSource={authenticateIcons.main}
        s={s}
        page={page}
      >
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
      </FigmaPageHeader>

      {unreadCount > 0 ? (
        <Pressable style={styles.noticeRow} onPress={() => router.push(databaseNotificationsHref())}>
          <Text style={styles.noticeText}>
            {unreadCount} new notification{unreadCount === 1 ? '' : 's'}
          </Text>
        </Pressable>
      ) : null}

      {showPending ? (
        <>
          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>YOUR SUBMISSIONS</Text>
          </View>

          {pending.length > 0 ? (
            pending.map((row) => {
              const linkedTitle = linkedCardTitleFromItems(row.items);
              return (
                <AuthenticateDraftCard
                  key={row.id}
                  cardImage={databaseIcons.recordMantle}
                  title={
                    linkedTitle
                      ? `${linkedTitle}\n${statusLabel(row.status)}`
                      : `Card submission\n${statusLabel(row.status)}`
                  }
                  description={row.user_notes?.trim() || 'Submitted from mobile capture.'}
                  tags={['MOBILE', row.status.toUpperCase()]}
                  meta={[
                    {
                      key: 'date',
                      icon: 'calendar',
                      label: row.submitted_at
                        ? new Date(row.submitted_at).toLocaleDateString()
                        : 'Draft'
                    }
                  ]}
                  s={s}
                  t={t}
                  onPress={() => router.push(submissionDetailHref(row.id))}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>{databaseCopy.submissionEmptyPending}</Text>
          )}
        </>
      ) : null}

      {showCompleted ? (
        <>
          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>REVIEWED</Text>
          </View>

          {completed.length > 0 ? (
            completed.map((row) => {
              const linkedTitle = linkedCardTitleFromItems(row.items);
              return (
                <AuthenticateScannedCard
                  key={row.id}
                  cardImage={databaseIcons.recordJordan}
                  title={linkedTitle ? `${linkedTitle}` : `Submission ${statusLabel(row.status)}`}
                  tags={[row.status.toUpperCase()]}
                  scannedAt={
                    row.submitted_at ? new Date(row.submitted_at).toLocaleDateString() : '�'
                  }
                  s={s}
                  t={t}
                  onPress={() => router.push(submissionDetailHref(row.id))}
                />
              );
            })
          ) : (
            <Text style={styles.emptyText}>{databaseCopy.submissionEmptyReviewed}</Text>
          )}
        </>
      ) : null}

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
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    tabRow: {
      flexWrap: 'nowrap',
      gap: s(14)
    },
    viewAllText: {
      fontFamily: appFonts.body,
      fontSize: 15,
      color: figmaColors.gray
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
