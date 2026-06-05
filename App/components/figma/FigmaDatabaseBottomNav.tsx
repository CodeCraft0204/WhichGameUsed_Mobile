import { type Href } from 'expo-router';
import React from 'react';
import { FigmaBottomNav } from '@/components/figma/FigmaBottomNav';

type DatabaseNavKey = 'database' | 'authenticate' | 'create' | 'discussion' | 'more';

type FigmaDatabaseBottomNavProps = {
  active: DatabaseNavKey;
};

/** database / more PNG filenames were exported with swapped artwork */
const navIcons = {
  database: require('@/assets/figma/database/nav_more.png'),
  authenticate: require('@/assets/figma/database/nav_authenticate.png'),
  create: require('@/assets/figma/database/nav_create.png'),
  discussion: require('@/assets/figma/database/nav_discussion.png'),
  more: require('@/assets/figma/database/nav_database.png')
};

const items = [
  { key: 'database', label: 'DATABASE', href: '/database/database' as Href, icon: navIcons.database },
  { key: 'authenticate', label: 'AUTHENTICATE', href: '/authenticate/authenticate' as Href, icon: navIcons.authenticate },
  { key: 'create', label: 'CREATE', href: '/create/create' as Href, icon: navIcons.create },
  { key: 'discussion', label: 'DISCUSSION', href: '/discussion/discussion' as Href, icon: navIcons.discussion },
  { key: 'more', label: 'MUCH MORE', href: '/advocacy/advocacy' as Href, icon: navIcons.more }
] as const;

export function FigmaDatabaseBottomNav({ active }: FigmaDatabaseBottomNavProps) {
  return <FigmaBottomNav items={items} activeKey={active} />;
}
