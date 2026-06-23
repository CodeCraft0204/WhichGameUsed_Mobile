import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  databaseIcons,
  type DatabaseMetaIconKey,
  type DatabaseMetaItem
} from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

const metaIconSources: Record<DatabaseMetaIconKey, number> = {
  person: databaseIcons.metaPerson,
  baseball: databaseIcons.metaBaseball,
  basketball: databaseIcons.metaBasketball,
  calendar: databaseIcons.metaCalendar,
  shield: databaseIcons.metaShield
};

type DatabaseRecordCardProps = {
  cardImage?: number;
  imageUrl?: string | null;
  title: string;
  description: string;
  tags: readonly string[];
  meta: readonly DatabaseMetaItem[];
  variant?: 'featured' | 'recent';
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

/** Shared card layout — featured vs recent differs only in surface color. */
export function DatabaseRecordCard({
  imageUrl,
  title,
  description,
  tags,
  meta,
  variant = 'featured',
  onPress,
  s,
  t
}: DatabaseRecordCardProps) {
  const styles = createStyles(s, t, variant);

  const content = (
    <>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="contain" />
        ) : (
          <Image
            source={databaseIcons.cardPlaceholder}
            style={styles.cardImage}
            resizeMode="cover"
            accessibilityLabel="No card image"
          />
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        {tags.length > 0 && (
          <View style={styles.tagRow}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {tag}
                </Text>
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
              <Text style={styles.metaText} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
        <Image source={databaseIcons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function createStyles(s: (n: number) => number, t: (n: number) => number, variant: 'featured' | 'recent') {
  const isFeatured = variant === 'featured';
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: isFeatured ? figmaColors.cardFeaturedBg : figmaColors.cardRecentBg,
      borderWidth: 1,
      borderColor: isFeatured ? figmaColors.cardFeaturedBorder : figmaColors.cardRecentBorder,
      borderRadius: s(15),
      minHeight: s(168),
      marginBottom: s(10),
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(6)
    },
    imageWrap: {
      width: s(128),
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardImage: {
      width: s(128),
      height: s(132)
    },
    body: {
      flex: 1,
      paddingHorizontal: s(8),
      justifyContent: 'center',
      gap: s(5),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(18),
      lineHeight: tb(24),
      color: figmaColors.charcoal
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(20),
      color: figmaColors.gray
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(5),
      marginTop: s(2)
    },
    tag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(7),
      paddingVertical: s(3),
      maxWidth: '100%'
    },
    tagText: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.gray
    },
    metaColumn: {
      width: s(132),
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative'
    },
    metaDivider: {
      width: 1,
      backgroundColor: figmaColors.metaDivider,
      marginVertical: s(4),
      marginRight: s(8)
    },
    metaContent: {
      flex: 1,
      justifyContent: 'center',
      gap: s(8),
      paddingRight: s(10),
      minWidth: 0
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(5)
    },
    metaIcon: {
      width: s(18),
      height: s(18),
      marginTop: s(1)
    },
    metaText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(16),
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
