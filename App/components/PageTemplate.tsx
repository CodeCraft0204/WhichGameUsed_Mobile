import { Link, type Href } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, lineHeight, radius, shadow, spacing } from '@/constants/theme';

type PageTemplateProps = {
  title: string;
  subtitle: string;
  body: string;
  activeTab: string;
  tabs: string[];
  sectionTitle: string;
  rows: Array<{ title: string; detail: string; metric?: string }>;
  bannerTitle: string;
  bannerText: string;
  navItems: Array<{ label: string; href: Href }>;
};

export function PageTemplate({
  title,
  subtitle,
  body,
  activeTab,
  tabs,
  sectionTitle,
  rows,
  bannerTitle,
  bannerText,
  navItems
}: PageTemplateProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.body}>{body}</Text>

          <View style={styles.utilityRail}>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityText}>Search</Text>
            </Pressable>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityText}>Profile</Text>
            </Pressable>
            <Pressable style={styles.utilityButton}>
              <Text style={styles.utilityText}>Settings</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <Pressable key={tab} style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionAction}>VIEW ALL</Text>
        </View>

        <View style={styles.cardsWrap}>
          {rows.map((row) => (
            <View key={row.title} style={styles.card}>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{row.title}</Text>
                <Text style={styles.cardDetail}>{row.detail}</Text>
              </View>
              <View style={styles.cardSide}>
                {row.metric ? <Text style={styles.metric}>{row.metric}</Text> : null}
                <Pressable style={styles.signButton}>
                  <Text style={styles.signButtonText}>OPEN</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{bannerTitle}</Text>
          <Text style={styles.bannerText}>{bannerText}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = item.label.toUpperCase() === title.toUpperCase();
          return (
            <Link asChild href={item.href} key={item.label}>
              <Pressable style={styles.navItem}>
                <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.pageBackground
  },
  container: {
    paddingTop: spacing.pageTop,
    paddingHorizontal: spacing.pageHorizontal,
    paddingBottom: 120,
    gap: spacing.lg
  },
  hero: {
    gap: spacing.sm,
    position: 'relative',
    paddingRight: 92
  },
  title: {
    fontSize: font.display,
    lineHeight: lineHeight.display,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 1.2
  },
  subtitle: {
    fontSize: font.subtitle,
    lineHeight: lineHeight.relaxed,
    color: colors.textSecondary,
    fontWeight: '700'
  },
  body: {
    fontSize: font.body,
    lineHeight: lineHeight.normal,
    color: colors.inkSoft
  },
  utilityRail: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 78,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.xl,
    backgroundColor: '#F2EFEA',
    padding: spacing.xs,
    gap: spacing.xs
  },
  utilityButton: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#FAF8F6',
    alignItems: 'center'
  },
  utilityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tabBorder,
    backgroundColor: colors.tabInactive
  },
  tabActive: {
    backgroundColor: colors.accentTab,
    borderColor: colors.accentTab
  },
  tabText: {
    fontSize: font.button,
    color: colors.inkSoft,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.white
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: font.sectionDisplay,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  sectionAction: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 14
  },
  cardsWrap: {
    gap: spacing.cardGap
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.card
  },
  cardTextWrap: {
    flex: 1,
    gap: spacing.xs
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700'
  },
  cardDetail: {
    color: colors.textMuted,
    fontSize: font.bodySmall,
    lineHeight: 20
  },
  cardSide: {
    minWidth: 92,
    alignItems: 'flex-end',
    gap: spacing.xs
  },
  metric: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700'
  },
  signButton: {
    backgroundColor: colors.accentTab,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#44484C'
  },
  signButtonText: {
    color: '#F5F4F2',
    fontWeight: '700',
    fontSize: 12
  },
  banner: {
    backgroundColor: colors.cardMutedBackground,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs
  },
  bannerTitle: {
    color: colors.ink,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700'
  },
  bannerText: {
    color: colors.textSecondary,
    fontSize: font.body,
    lineHeight: lineHeight.normal
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderStrong,
    backgroundColor: '#F7F5F3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  navItem: {
    paddingHorizontal: 4,
    paddingVertical: spacing.xs
  },
  navText: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700'
  },
  navTextActive: {
    color: colors.accentBronze
  }
});
