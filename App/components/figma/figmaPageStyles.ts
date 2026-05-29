import { StyleSheet } from 'react-native';

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
      color: '#35393d',
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
      color: '#6d7074',
      width: s(340)
    },
    description: {
      marginTop: s(24),
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(20),
      lineHeight: t(26),
      color: '#898a8d',
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
      borderColor: '#b3a499',
      backgroundColor: '#fcf9f7',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(12)
    },
    tabButtonActive: {
      backgroundColor: '#292c30',
      borderColor: '#1a1b21'
    },
    tabText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: '#8c8e91'
    },
    tabTextActive: {
      color: '#999b9e'
    },
    sectionHeaderRow: {
      marginTop: s(14),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#f1ece8',
      paddingTop: s(10)
    },
    sectionTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      marginVertical: s(16),
      fontSize: t(26),
      color: '#42454a'
    },
    viewAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      color: '#838588'
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
      borderColor: '#e6e2df',
      backgroundColor: '#f3f0ec',
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
      color: '#464a4e',
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(21),
      lineHeight: t(24),
      color: '#848586'
    },
    ctaArrow: {
      width: s(37),
      height: s(27),
      marginRight: s(6)
    },
    bottomNav: {
      minHeight: s(120),
      backgroundColor: '#f7f5f3',
      borderTopWidth: 1,
      borderTopColor: '#f3f1ef',
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: s(8),
      paddingBottom: s(4)
    },
    navItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(5),
      minWidth: 0,
      paddingHorizontal: s(2)
    },
    navIcon: {
      width: s(60),
      height: s(60)
    },
    navText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(11),
      lineHeight: t(13),
      color: '#7e8082',
      textAlign: 'center'
    },
    navTextActive: {
      color: '#b0927d'
    }
  });
}
