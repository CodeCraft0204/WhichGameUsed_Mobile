import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { figmaNavTheme } from '@/constants/figmaNavTheme';
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
};

/** Shared bottom nav — always uses default Figma scale (matches Advocacy). */
export function FigmaBottomNav({ items, activeKey }: FigmaBottomNavProps) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);

  return (
    <View style={page.bottomNav}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const iconTint = isActive ? figmaNavTheme.iconActive : figmaNavTheme.iconInactive;

        return (
          <View key={item.key} style={page.navSlot}>
            <Pressable
              style={StyleSheet.flatten([page.navItem, isActive && page.navItemActive])}
              disabled={isActive}
              onPress={isActive ? undefined : () => router.push(item.href)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Image
                source={item.icon}
                style={[page.navIcon, { tintColor: iconTint }]}
                resizeMode="contain"
              />
              <Text
                style={StyleSheet.flatten([page.navText, isActive && page.navTextActive])}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
