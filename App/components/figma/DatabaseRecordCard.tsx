import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  databaseIcons,
  type DatabaseMetaIconKey,
  type DatabaseMetaItem
} from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';

const metaIconSources: Record<DatabaseMetaIconKey, number> = {
  person: databaseIcons.metaPerson,
  baseball: databaseIcons.metaBaseball,
  basketball: databaseIcons.metaBasketball,
  calendar: databaseIcons.metaCalendar,
  shield: databaseIcons.metaShield
};

type DatabaseRecordCardProps = {
  cardImage: number;
  title: string;
  description: string;
  tags: readonly string[];
  meta: readonly DatabaseMetaItem[];
  variant?: 'featured' | 'recent';
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseRecordCard({
  cardImage,
  title,
  description,
  tags,
  meta,
  variant = 'featured',
  s,
  t
}: DatabaseRecordCardProps) {
  const styles = createStyles(s, t, variant);
  const isFeatured = variant === 'featured';

  return (
    <View style={styles.card}>
      <Image source={cardImage} style={styles.cardImage} resizeMode="contain" />

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.metaColumn}>
        <View style={styles.metaDivider} />
        <View style={styles.metaContent}>
          {meta.map((item) => (
            <View key={item.key} style={styles.metaRow}>
              <Image source={metaIconSources[item.icon]} style={styles.metaIcon} resizeMode="contain" />
              <Text style={styles.metaText}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Image source={databaseIcons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, variant: 'featured' | 'recent') {
  const isFeatured = variant === 'featured';

  return StyleSheet.create({
    card: {
      backgroundColor: isFeatured ? '#f9f6f1' : '#f9f5f0',
      borderWidth: isFeatured ? 1 : 7,
      borderColor: isFeatured ? '#ebe7e3' : '#eeeae6',
      borderRadius: s(isFeatured ? 16 : 18),
      minHeight: s(isFeatured ? 185 : 158),
      marginBottom: s(10),
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(8)
    },
    cardImage: {
      width: s(isFeatured ? 151 : 140),
      height: s(isFeatured ? 154 : 91),
      alignSelf: 'center'
    },
    body: {
      flex: 1,
      paddingHorizontal: s(8),
      justifyContent: 'center',
      gap: s(6),
      minWidth: 0
    },
    title: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(isFeatured ? 20 : 16),
      lineHeight: t(isFeatured ? 27 : 22),
      color: figmaColors.charcoal
    },
    description: {
      fontFamily: isFeatured ? 'EBGaramond_700Bold' : 'EBGaramond_400Regular',
      fontSize: t(isFeatured ? 15 : 14),
      lineHeight: t(isFeatured ? 20 : 18),
      color: figmaColors.gray
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: s(2)
    },
    tag: {
      backgroundColor: '#eee8df',
      borderWidth: 1,
      borderColor: '#f6f2ec',
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    tagText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(10),
      color: figmaColors.gray
    },
    metaColumn: {
      width: s(isFeatured ? 148 : 128),
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative'
    },
    metaDivider: {
      width: 1,
      backgroundColor: '#ddd8d4',
      marginVertical: s(4),
      marginRight: s(10)
    },
    metaContent: {
      flex: 1,
      justifyContent: 'center',
      gap: s(isFeatured ? 8 : 10),
      paddingRight: s(12)
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    metaIcon: {
      width: s(16),
      height: s(16)
    },
    metaText: {
      flex: 1,
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    cardChevron: {
      position: 'absolute',
      right: 0,
      top: '50%',
      marginTop: s(-8),
      width: s(9),
      height: s(15)
    }
  });
}
