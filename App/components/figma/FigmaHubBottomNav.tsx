import React from 'react';
import { FigmaBottomNav } from '@/components/figma/FigmaBottomNav';
import { hubNavItems, type HubNavKey } from '@/constants/figmaShared';

type FigmaHubBottomNavProps = {
  active: HubNavKey;
};

export function FigmaHubBottomNav({ active }: FigmaHubBottomNavProps) {
  return <FigmaBottomNav items={hubNavItems} activeKey={active} />;
}
