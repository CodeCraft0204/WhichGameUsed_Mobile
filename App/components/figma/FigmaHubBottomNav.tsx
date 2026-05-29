import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { hubNavItems, type HubNavKey } from '@/constants/figmaShared';

type FigmaHubBottomNavProps = {
  active: HubNavKey;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function FigmaHubBottomNav({ active, s, t }: FigmaHubBottomNavProps) {
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);

  return (
    <View style={page.bottomNav}>
      {hubNavItems.map((item) => {
        const isActive = item.key === active;
        const content = (
          <Pressable style={page.navItem}>
            <Image source={item.icon} style={page.navIcon} resizeMode="contain" />
            <Text style={[page.navText, isActive && page.navTextActive]} numberOfLines={2}>
              {item.label}
            </Text>
          </Pressable>
        );

        if (isActive) {
          return <View key={item.key}>{content}</View>;
        }

        return (
          <Link key={item.key} href={item.href} asChild>
            {content}
          </Link>
        );
      })}
    </View>
  );
}
