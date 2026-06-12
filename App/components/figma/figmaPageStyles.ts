import { StyleSheet } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { figmaNavTheme } from '@/constants/figmaNavTheme';

/** Typography and spacing aligned with the advocacy screen (810 design width). */
export function createFigmaPageStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    scrollContent: {
      paddingHorizontal: s(20),
      paddingTop: s(14),
      paddingBottom: s(16)
    },
    headerSection: {
      position: 'relative',
      paddingRight: s(72),
      marginBottom: s(4)
    },
    title: {
      fontFamily: appFonts.display,
      marginTop: s(12),
      fontSize: t(52),
      lineHeight: t(58),
      color: figmaColors.charcoal,
      letterSpacing: 0.6,
      transform: [{ rotate: '-4deg' }]
    },
    titleBrush: {
      width: s(338),
      height: s(33),
      marginTop: s(10),
      marginLeft: s(2)
    },
    subtitle: {
      marginTop: s(12),
      fontFamily: appFonts.accent,
      fontSize: tb(20),
      lineHeight: tb(26),
      color: figmaColors.gray,
      ...broadsheetAccent
    },
    description: {
      marginTop: s(12),
      fontFamily: appFonts.body,
      fontSize: tb(19),
      lineHeight: tb(26),
      color: figmaColors.gray
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
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.tabText
    },
    tabTextActive: {
      color: figmaColors.tabTextActive
    },
    sectionHeaderRow: {
      marginBottom: s(5),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopColor: figmaColors.divider,
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      marginVertical: s(16),
      fontSize: t(20),
      color: figmaColors.charcoal
    },
    viewAllText: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      color: figmaColors.gray,
      ...broadsheetAccent,
      letterSpacing: 0.8
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
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: appFonts.body,
      fontSize: tb(21),
      lineHeight: tb(24),
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
    bottomNavIconsOnly: {
      minHeight: s(figmaNavTheme.barMinHeightIconsOnly),
      paddingTop: s(figmaNavTheme.barPaddingIconsOnlyTop),
      paddingBottom: s(figmaNavTheme.barPaddingIconsOnlyBottom)
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
      fontFamily: appFonts.accent,
      fontSize: tb(figmaNavTheme.labelFontSize),
      lineHeight: tb(figmaNavTheme.labelLineHeight),
      color: figmaNavTheme.label,
      textAlign: 'center',
      width: '100%'
    },
    navTextActive: {
      color: figmaNavTheme.labelActive
    }
  });
}
