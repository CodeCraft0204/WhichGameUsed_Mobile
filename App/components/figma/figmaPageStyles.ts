import { StyleSheet } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaNavTheme } from '@/constants/figmaNavTheme';

/** Typography and spacing aligned with the advocacy screen (810 design width). */
export function createFigmaPageStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: s(20),
      paddingTop: s(14),
      paddingBottom: s(16)
    },
    headerSection: {
      position: 'relative',
      minHeight: s(420)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      marginTop: s(16),
      fontSize: t(50),
      lineHeight: t(80),
      color: figmaColors.charcoal,
      letterSpacing: 0.6,
      transform: [{ rotate: '-4deg' }],
      width: s(360)
    },
    titleBrush: {
      width: s(338),
      height: s(33),
      marginTop: s(-14),
      marginLeft: s(2)
    },
    subtitle: {
      marginTop: s(26),
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      lineHeight: t(26),
      color: figmaColors.gray,
      width: s(340)
    },
    description: {
      marginTop: s(24),
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(20),
      lineHeight: t(26),
      color: figmaColors.gray,
      width: s(380)
    },
    tabRow: {
      marginTop: s(32),
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(18)
    },
    tabButton: {
      minWidth: s(124),
      height: s(42),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.tabInactiveBorder,
      backgroundColor: figmaColors.tabInactiveBg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(12)
    },
    tabButtonActive: {
      backgroundColor: figmaColors.tabActiveBg,
      borderColor: figmaColors.tabActiveBorder
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: figmaColors.tabText
    },
    tabTextActive: {
      color: figmaColors.tabTextActive
    },
    sectionHeaderRow: {
      marginTop: s(14),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopColor: figmaColors.divider,
      paddingTop: s(10)
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      marginVertical: s(16),
      fontSize: t(26),
      color: figmaColors.charcoal
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      color: figmaColors.gray
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    sectionChevron: {
      marginLeft: s(12),
      width: s(10),
      height: s(17)
    },
    ctaCard: {
      minHeight: s(116),
      borderRadius: s(15),
      borderWidth: 1,
      borderColor: figmaColors.ctaBorder,
      backgroundColor: figmaColors.ctaBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(10)
    },
    ctaIcon: {
      width: s(164),
      height: s(114)
    },
    ctaTextWrap: {
      flex: 1,
      paddingHorizontal: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(21),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    ctaArrow: {
      width: s(37),
      height: s(27),
      marginRight: s(6)
    },
    bottomNav: {
      minHeight: s(figmaNavTheme.barMinHeight),
      backgroundColor: figmaNavTheme.barBackground,
      borderTopWidth: 1,
      borderTopColor: figmaNavTheme.barBorder,
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingTop: s(figmaNavTheme.barPaddingTop),
      paddingBottom: s(figmaNavTheme.barPaddingBottom),
      paddingHorizontal: s(figmaNavTheme.barPaddingHorizontal)
    },
    navSlot: {
      flex: 1,
      minWidth: 0
    },
    navItem: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(figmaNavTheme.itemGap),
      paddingVertical: s(6),
      paddingHorizontal: s(2),
      borderRadius: s(figmaNavTheme.itemRadius)
    },
    navItemActive: {
      backgroundColor: figmaNavTheme.itemActiveBackground
    },
    navIcon: {
      width: s(figmaNavTheme.iconSize),
      height: s(figmaNavTheme.iconSize)
    },
    navText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(figmaNavTheme.labelFontSize),
      lineHeight: t(figmaNavTheme.labelLineHeight),
      color: figmaNavTheme.label,
      textAlign: 'center',
      width: '100%'
    },
    navTextActive: {
      color: figmaNavTheme.label
    }
  });
}
