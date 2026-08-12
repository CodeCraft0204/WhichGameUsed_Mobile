import { remoteAsset } from '@/constants/remoteAssets';
import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader, HEADER_TOOLBAR_GAP_UNITS } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { CampaignProgressBar } from '@/components/advocacy/CampaignProgressBar';
import { advocacyCopy } from '@/constants/advocacyCopy';
import { figmaColors } from '@/constants/figmaColors';
import { discussionHref } from '@/constants/navigation';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { figmaIcons } from '@/constants/figmaIcons';
import {
  advocacyCampaignHref,
  advocacyMyAdvocacyHref,
  advocacySubmitIssueHref
} from '@/constants/navigation';
import {
  ADVOCACY_LIST_FILTERS,
  ADVOCACY_SPORT_FILTERS,
  advocacyStatusLabel,
  advocacyTypeLabel,
  formatAdvocacyCount,
  getAdvocacyHubSummary,
  listAdvocacyInitiatives,
  mapSportLabelToFilter,
  mapTabLabelToFilter,
  type AdvocacyHubSummary,
  type AdvocacyInitiativeListItem,
  type AdvocacyListFilter,
  type AdvocacySportFilter
} from '@/lib/advocacy';

const icons = {
  hero: remoteAsset('figma/advocacy/hero_illustration.png'),
  fallback: remoteAsset('figma/advocacy/petition_panini.png'),
  ctaIcon: figmaIcons.megaphone,
  ctaArrow: remoteAsset('figma/advocacy/section_chevron.png'),
  myAdvocacy: figmaIcons.bookmark,
  submitIssue: figmaIcons.scrollQuestion
};

const tabLabels = ADVOCACY_LIST_FILTERS.map((f) => f.label);
const sportLabels = ADVOCACY_SPORT_FILTERS.map((f) => f.label);

export default function AdvocacyScreen() {
  return (
    <ContextHeaderScrollProvider>
      <AdvocacyScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function InitiativeCard({
  item,
  styles,
  s,
  onPress
}: {
  item: AdvocacyInitiativeListItem;
  styles: ReturnType<typeof createLocalStyles>;
  s: (n: number) => number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image
        source={item.cover_image_url ? { uri: item.cover_image_url } : icons.fallback}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.meta}>
          {advocacyTypeLabel(item.initiative_type)} · {advocacyStatusLabel(item.status)}
        </Text>
        <Text style={styles.cardTitle} numberOfLines={3}>
          {item.title}
        </Text>
        {item.summary ? (
          <Text style={styles.cardDescription} numberOfLines={3}>
            {item.summary}
          </Text>
        ) : null}
        {item.progress != null || (item.goal_count != null && item.goal_count > 0) ? (
          <CampaignProgressBar progress={item.progress} s={s} style={{ marginTop: s(4) }} />
        ) : null}
        <Text style={styles.metrics}>
          {formatAdvocacyCount(item.supporter_count)} supporters ·{' '}
          {formatAdvocacyCount(item.confirmed_evidence_count)} evidence ·{' '}
          {formatAdvocacyCount(item.update_count)} updates
        </Text>
      </View>
    </Pressable>
  );
}

function AdvocacyScreenBody() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const [sportTab, setSportTab] = useState(sportLabels[0]);
  const filter = mapTabLabelToFilter(activeTab);
  const sport = mapSportLabelToFilter(sportTab);
  const [items, setItems] = useState<AdvocacyInitiativeListItem[]>([]);
  const [summary, setSummary] = useState<AdvocacyHubSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  const load = useCallback(async (nextFilter: AdvocacyListFilter, nextSport: AdvocacySportFilter) => {
    setLoading(true);
    const [listRes, sumRes] = await Promise.all([
      listAdvocacyInitiatives(nextFilter, nextSport),
      getAdvocacyHubSummary()
    ]);
    setItems(listRes.items);
    setError(listRes.error ?? sumRes.error);
    setSummary(sumRes.summary);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(filter, sport);
    }, [filter, load, sport])
  );

  const featured = items.find((i) => i.promoted_rank != null) ?? items[0] ?? null;
  const alerts = items.filter(
    (i) => i.initiative_type === 'collector_alert' && ['active', 'awaiting_response'].includes(i.status)
  );
  const transparency = items.filter((i) =>
    ['transparency_initiative', 'standards_proposal'].includes(i.initiative_type)
  );
  const gathering = items.filter((i) => i.status === 'evidence_gathering');
  const outcomes = items.filter((i) => i.status === 'resolved' || i.status === 'closed');

  return (
    <FigmaScreen bottomNav={<FigmaHubBottomNav active="advocacy" />} scrollProps={scrollProps}>
      <FigmaPageHeader
        title={advocacyCopy.hubTitle}
        subtitle={advocacyCopy.hubSubtitle}
        description={advocacyCopy.hubDescription}
        heroSource={icons.hero}
        guidanceKey="advocacy"
        s={s}
        page={page}
      />

      <View style={styles.toolbar}>
        <FigmaChipRow
          options={chipOptionsFromLabels(tabLabels)}
          value={activeTab}
          onChange={setActiveTab}
          s={s}
          t={t}
          style={styles.chipRow}
        />
        <FigmaChipRow
          options={chipOptionsFromLabels(sportLabels)}
          value={sportTab}
          onChange={setSportTab}
          s={s}
          t={t}
          style={styles.chipRowTight}
        />
      </View>

      {summary ? (
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            {summary.active_count} Active Initiatives · {summary.gathering_evidence_count} Gathering
            Evidence · {summary.resolved_count} Resolved Issues
          </Text>
          <Text style={styles.tipText}>{advocacyCopy.mwVsAdvocacyTip}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.metaText}>{error}</Text> : null}
      {loading && items.length === 0 ? <Text style={styles.metaText}>Loading…</Text> : null}
      {!loading && !error && items.length === 0 ? (
        <Text style={styles.metaText}>{advocacyCopy.empty}</Text>
      ) : null}

      {featured && filter === 'all' ? (
        <>
          <Text style={page.sectionTitle}>{advocacyCopy.featured}</Text>
          <InitiativeCard
            item={featured}
            styles={styles}
            s={s}
            onPress={() => router.push(advocacyCampaignHref(featured.id))}
          />
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push(advocacyCampaignHref(featured.id))}
          >
            <Text style={styles.primaryBtnText}>{advocacyCopy.viewInitiative}</Text>
          </Pressable>
        </>
      ) : null}

      {filter === 'all' ? (
        <>
          {alerts.length > 0 ? (
            <>
              <Text style={page.sectionTitle}>{advocacyCopy.activeAlerts}</Text>
              {alerts.map((item) => (
                <InitiativeCard
                  key={item.id}
                  item={item}
                  styles={styles}
                  s={s}
                  onPress={() => router.push(advocacyCampaignHref(item.id))}
                />
              ))}
            </>
          ) : null}
          {transparency.length > 0 ? (
            <>
              <Text style={page.sectionTitle}>{advocacyCopy.transparencyStandards}</Text>
              {transparency.map((item) => (
                <InitiativeCard
                  key={item.id}
                  item={item}
                  styles={styles}
                  s={s}
                  onPress={() => router.push(advocacyCampaignHref(item.id))}
                />
              ))}
            </>
          ) : null}
          {gathering.length > 0 ? (
            <>
              <Text style={page.sectionTitle}>{advocacyCopy.gatheringEvidence}</Text>
              {gathering.map((item) => (
                <InitiativeCard
                  key={item.id}
                  item={item}
                  styles={styles}
                  s={s}
                  onPress={() => router.push(advocacyCampaignHref(item.id))}
                />
              ))}
            </>
          ) : null}
          {outcomes.length > 0 ? (
            <>
              <Text style={page.sectionTitle}>{advocacyCopy.recentOutcomes}</Text>
              {outcomes.map((item) => (
                <InitiativeCard
                  key={item.id}
                  item={item}
                  styles={styles}
                  s={s}
                  onPress={() => router.push(advocacyCampaignHref(item.id))}
                />
              ))}
            </>
          ) : null}
        </>
      ) : (
        items.map((item) => (
          <InitiativeCard
            key={item.id}
            item={item}
            styles={styles}
            s={s}
            onPress={() => router.push(advocacyCampaignHref(item.id))}
          />
        ))
      )}

      <Text style={page.sectionTitle}>{advocacyCopy.howItWorks}</Text>
      <Text style={[styles.tipText, { marginBottom: s(16) }]}>{advocacyCopy.howBody}</Text>

      <View style={styles.bottomActions}>
        <View style={styles.quickLinksRow}>
          <Pressable
            style={styles.quickLinkCard}
            onPress={() => router.push(advocacyMyAdvocacyHref())}
            accessibilityRole="button"
            accessibilityLabel={advocacyCopy.myAdvocacy}
          >
            <Image source={icons.myAdvocacy} style={styles.quickLinkIcon} resizeMode="contain" />
            <Text style={styles.quickLinkLabel} numberOfLines={2}>
              {advocacyCopy.myAdvocacy}
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickLinkCard}
            onPress={() => router.push(advocacySubmitIssueHref())}
            accessibilityRole="button"
            accessibilityLabel={advocacyCopy.submitIssue}
          >
            <Image source={icons.submitIssue} style={styles.quickLinkIcon} resizeMode="contain" />
            <Text style={styles.quickLinkLabel} numberOfLines={2}>
              {advocacyCopy.submitIssue}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={page.ctaCard}
          onPress={() => router.push(discussionHref())}
          accessibilityRole="button"
          accessibilityLabel="Open discussion"
        >
          <Image source={icons.ctaIcon} style={page.ctaIcon} resizeMode="contain" />
          <View style={page.ctaTextWrap}>
            <Text style={page.ctaTitle}>Share your stories with the Squad.</Text>
            <Text style={page.ctaBody}>
              Whether you have research or a rumor, a question or an answer, share your thoughts. A
              place to discuss (almost) all things hobby related.
            </Text>
          </View>
          <Image source={icons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
        </Pressable>
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    toolbar: {
      width: '100%',
      alignSelf: 'stretch',
      marginTop: s(HEADER_TOOLBAR_GAP_UNITS),
      marginBottom: s(16),
      gap: s(10)
    },
    chipRow: {
      width: '100%',
      alignSelf: 'stretch',
      marginTop: 0,
      marginBottom: 0,
      marginVertical: 0
    },
    chipRowTight: {
      width: '100%',
      alignSelf: 'stretch',
      marginTop: 0,
      marginBottom: 0,
      marginVertical: 0
    },
    bottomActions: {
      marginTop: s(8),
      gap: s(10),
      paddingTop: s(6),
      marginBottom: s(8)
    },
    quickLinksRow: {
      flexDirection: 'row',
      gap: s(18)
    },
    quickLinkCard: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.ctaBackground,
      paddingVertical: s(12),
      paddingHorizontal: s(10)
    },
    quickLinkIcon: {
      width: s(16),
      height: s(18),
      opacity: 0.85,
      flexShrink: 0
    },
    quickLinkLabel: {
      flex: 1,
      minWidth: 0,
      fontFamily: appFonts.body,
      textAlign: 'center',
      fontWeight: '600',
      fontSize: tb(16),
      lineHeight: tb(18),
      color: figmaColors.charcoal
    },
    summaryStrip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      borderRadius: s(12),
      padding: s(12),
      marginTop: s(2),
      marginBottom: s(14)
    },
    summaryText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.charcoal
    },
    tipText: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.gray,
      marginTop: s(8)
    },
    metaText: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      marginBottom: s(10),
      flexDirection: 'row',
      overflow: 'hidden'
    },
    cardImage: { width: s(120), height: s(140) },
    cardBody: { flex: 1, padding: s(12), gap: s(4) },
    meta: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 0.6
    },
    cardTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(20),
      lineHeight: tb(24),
      color: figmaColors.charcoal
    },
    cardDescription: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(20),
      color: figmaColors.gray
    },
    metrics: {
      marginTop: s(4),
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    },
    primaryBtn: {
      height: s(48),
      borderRadius: s(24),
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.buttonPrimaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(16)
    },
    primaryBtnText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.buttonPrimaryText
    }
  });
}
