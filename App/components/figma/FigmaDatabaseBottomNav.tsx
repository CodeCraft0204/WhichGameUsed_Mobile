import { Link, type Href } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';

type DatabaseNavKey = 'database' | 'authenticate' | 'create' | 'discussion' | 'more';

type NavItem = {
  key: DatabaseNavKey;
  label: string;
  href: Href;
  icon: number;
};

type FigmaDatabaseBottomNavProps = {
  active: DatabaseNavKey;
  s: (n: number) => number;
  t: (n: number) => number;
};

const navIcons = {
  database: require('@/assets/figma/database/nav_database.png'),
  authenticate: require('@/assets/figma/database/nav_authenticate.png'),
  create: require('@/assets/figma/database/nav_create.png'),
  discussion: require('@/assets/figma/database/nav_discussion.png'),
  more: require('@/assets/figma/database/nav_more.png')
};

const items: NavItem[] = [
  { key: 'database', label: 'DATABASE', href: '/database/database', icon: navIcons.database },
  { key: 'authenticate', label: 'AUTHENTICATE', href: '/authenticate/authenticate', icon: navIcons.authenticate },
  { key: 'create', label: 'CREATE', href: '/camera/camera', icon: navIcons.create },
  { key: 'discussion', label: 'DISCUSSION', href: '/discussion/discussion', icon: navIcons.discussion },
  { key: 'more', label: 'MUCH MORE', href: '/advocacy/advocacy', icon: navIcons.more }
];

export function FigmaDatabaseBottomNav({ active, s, t }: FigmaDatabaseBottomNavProps) {
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);

  return (
    <View style={page.bottomNav}>
      {items.map((item) => {
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
