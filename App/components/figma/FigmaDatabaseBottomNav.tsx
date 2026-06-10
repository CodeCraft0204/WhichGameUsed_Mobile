import { type Href } from 'expo-router';
import React from 'react';
import { FigmaBottomNav } from '@/components/figma/FigmaBottomNav';
import { figmaIcons } from '@/constants/figmaIcons';

type DatabaseNavKey = 'database' | 'authenticate' | 'create' | 'discussion' | 'more';

type FigmaDatabaseBottomNavProps = {
  active: DatabaseNavKey;
};

const items = [
  { key: 'database', label: 'DATABASE', href: '/database/database' as Href, icon: figmaIcons.navDatabase },
  { key: 'authenticate', label: 'AUTHENTICATE', href: '/authenticate/authenticate' as Href, icon: figmaIcons.navAuthenticate },
  { key: 'create', label: 'CREATE', href: '/create/create' as Href, icon: figmaIcons.navCreate },
  { key: 'discussion', label: 'DISCUSSION', href: '/discussion/discussion' as Href, icon: figmaIcons.navDiscussion },
  { key: 'more', label: 'MUCH MORE', href: '/advocacy/advocacy' as Href, icon: figmaIcons.navMore }
] as const;

export function FigmaDatabaseBottomNav({ active }: FigmaDatabaseBottomNavProps) {
  return <FigmaBottomNav items={items} activeKey={active} />;
}
