import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  authenticateIcons,
  type AuthenticateDraftRecord,
  type AuthenticateMetaIconKey,
  type AuthenticateScannedRecord
} from '@/constants/authenticateContent';
import { figmaColors } from '@/constants/figmaColors';

const metaIconSources: Record<AuthenticateMetaIconKey, number> = {
  calendar: authenticateIcons.metaCalendar,
  clock: authenticateIcons.metaClock,
  scan: authenticateIcons.metaScan
};

type AuthenticateDraftCardProps = AuthenticateDraftRecord & {
  imageUrl?: string | null;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function AuthenticateDraftCard({
  imageUrl,
  title,
  description,
  tags,
  meta,
  onPress,
  s,
  t
}: AuthenticateDraftCardProps) {
  const styles = createDraftStyles(s, t);

  const content = (
    <>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>NO IMAGE</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.metaColumn}>
        <View style={styles.metaDivider} />
        <View style={styles.metaContent}>
          {meta.map((item) => (
            <View key={item.key} style={styles.metaRow}>
              <Image source={metaIconSources[item.icon]} style={styles.metaIcon} resizeMode="contain" />
              <Text style={[styles.metaText, item.accent && styles.metaTextAccent]}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Image source={authenticateIcons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
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

type AuthenticateScannedCardProps = AuthenticateScannedRecord & {
  imageUrl?: string | null;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function AuthenticateScannedCard({
  imageUrl,
  title,
  tags,
  scannedAt,
  onPress,
  s,
  t
}: AuthenticateScannedCardProps) {
  const styles = createScannedStyles(s, t);

  const content = (
    <>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>NO IMAGE</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.metaColumn}>
        <View style={styles.metaDivider} />
        <View style={styles.metaContent}>
          <View style={styles.metaRow}>
            <Image source={metaIconSources.scan} style={styles.metaIcon} resizeMode="contain" />
            <Text style={styles.metaText}>{scannedAt}</Text>
          </View>
        </View>
        <Image source={authenticateIcons.cardChevron} style={styles.cardChevron} resizeMode="contain" />
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

function createDraftStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardFeaturedBg,
      borderWidth: 1,
      borderColor: figmaColors.cardFeaturedBorder,
      borderRadius: s(16),
      minHeight: s(185),
      marginBottom: s(10),
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(8)
    },
    cardImage: {
      width: s(151),
      height: s(154),
      alignSelf: 'center',
      borderRadius: s(8)
    },
    imagePlaceholder: {
      width: s(151),
      height: s(154),
      alignSelf: 'center',
      borderRadius: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.divider,
      alignItems: 'center',
      justifyContent: 'center'
    },
    imagePlaceholderText: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray
    },
    body: {
      flex: 1,
      paddingHorizontal: s(8),
      justifyContent: 'center',
      gap: s(6),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(20),
      lineHeight: tb(27),
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
      gap: s(6),
      marginTop: s(2)
    },
    tag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    tagText: {
      fontFamily: appFonts.body,
      fontSize: tb(10),
      color: figmaColors.gray
    },
    metaColumn: {
      width: s(148),
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative'
    },
    metaDivider: {
      width: 1,
      backgroundColor: figmaColors.metaDivider,
      marginVertical: s(4),
      marginRight: s(10)
    },
    metaContent: {
      flex: 1,
      justifyContent: 'center',
      gap: s(10),
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
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(16),
      color: figmaColors.gray
    },
    metaTextAccent: {
      color: figmaColors.bronze
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

function createScannedStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardRecentBg,
      borderWidth: 1,
      borderColor: figmaColors.cardRecentBorder,
      borderRadius: s(14),
      minHeight: s(120),
      marginBottom: s(10),
      flexDirection: 'row',
      alignItems: 'stretch',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(8)
    },
    cardImage: {
      width: s(120),
      height: s(78),
      alignSelf: 'center',
      borderRadius: s(8)
    },
    imagePlaceholder: {
      width: s(120),
      height: s(78),
      alignSelf: 'center',
      borderRadius: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.divider,
      alignItems: 'center',
      justifyContent: 'center'
    },
    imagePlaceholderText: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.gray
    },
    body: {
      flex: 1,
      paddingHorizontal: s(8),
      justifyContent: 'center',
      gap: s(8),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6)
    },
    tag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(7),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    tagText: {
      fontFamily: appFonts.body,
      fontSize: tb(10),
      color: figmaColors.gray
    },
    metaColumn: {
      width: s(128),
      flexDirection: 'row',
      alignItems: 'stretch',
      position: 'relative'
    },
    metaDivider: {
      width: 1,
      backgroundColor: figmaColors.metaDivider,
      marginVertical: s(4),
      marginRight: s(10)
    },
    metaContent: {
      flex: 1,
      justifyContent: 'center',
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
      fontFamily: appFonts.body,
      fontSize: tb(14),
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
