import React from 'react';
import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { databaseIcons } from '@/constants/databaseContent';

type HuntCardImageProps = {
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  style?: StyleProp<ImageStyle>;
};

/** Renders hunt card art from DB URL, resolved catalog image, or neutral placeholder. */
export function HuntCardImage({ coverImageUrl, imageUrl, style }: HuntCardImageProps) {
  const uri = imageUrl ?? coverImageUrl;
  if (uri) {
    return <Image source={{ uri }} style={style} resizeMode="contain" />;
  }
  return <Image source={databaseIcons.cardPlaceholder} style={style} resizeMode="contain" />;
}

export function huntImageStyles(width: number, height: number) {
  return StyleSheet.create({
    image: { width, height }
  });
}
