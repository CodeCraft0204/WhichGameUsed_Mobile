import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export type FigmaBottomNavItem = {
  key: string;
  label: string;
  href: import('expo-router').Href;
  icon: number;
};

type FigmaBottomNavProps = {
  items: readonly FigmaBottomNavItem[];
  activeKey: string;
  /** When false, only icons are shown (labels remain for accessibility). */
  showLabels?: boolean;
};

/** Shared bottom nav — always uses default Figma scale (matches Advocacy). */
export function FigmaBottomNav({ items, activeKey, showLabels = true }: FigmaBottomNavProps) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);

  return (
    <View style={[page.bottomNav, !showLabels && page.bottomNavIconsOnly]}>
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <View key={item.key} style={page.navSlot}>
            <Pressable
              style={StyleSheet.flatten([page.navItem, isActive && page.navItemActive])}
              disabled={isActive}
              onPress={isActive ? undefined : () => router.push(item.href)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: isActive }}
            >
              <Image source={item.icon} style={page.navIcon} resizeMode="contain" />
              {showLabels ? (
                <Text
                  style={StyleSheet.flatten([page.navText, isActive && page.navTextActive])}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
