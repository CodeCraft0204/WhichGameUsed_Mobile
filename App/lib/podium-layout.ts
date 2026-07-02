/**
 * Podium sizing — avatar ring targets match FigmaPageHeader hero (182×200 @ 1.5×).
 */
import { POINTS_PILL_ASPECT, PODIUM_LAYOUT } from '@/constants/leaderboardAssets';

/** Same refs as FigmaPageHeader heroWidth / heroHeight × 1.5 multiplier. */
export const PODIUM_HERO_WIDTH = 182 * 1.5;
export const PODIUM_HERO_HEIGHT = 200 * 1.5;

export type PodiumSlotSize = { width: number; height: number };

export type PodiumSlotMetrics = {
  laurel: number;
  ring: number;
  avatar: number;
  pillW: number;
  pillH: number;
  nameSize: number;
  roleSize: number;
  gap: number;
  youSize: number;
};

export function podiumHeroRingTarget(rank: 1 | 2 | 3, s: (n: number) => number): number {
  const hero = Math.min(s(PODIUM_HERO_WIDTH), s(PODIUM_HERO_HEIGHT));
  if (rank === 1) return hero;
  if (rank === 2) return hero * 0.92;
  return hero * 0.88;
}

function layoutCardShare(rank: 1 | 2 | 3): number {
  const layout = PODIUM_LAYOUT[rank];
  return layout.cardFlex / (layout.topFlex + layout.cardFlex + layout.baseFlex);
}

function estimateStackHeight(
  ring: number,
  w: number,
  s: (n: number) => number,
  includeYou = true
): number {
  const gap = Math.max(3, 4);
  const nameSize = Math.max(10, w * 0.1);
  const roleSize = Math.max(8, w * 0.08);
  const youSize = Math.max(8, roleSize * 0.9);
  const pillW = w * 0.92;
  const pillH = Math.max(12, pillW / POINTS_PILL_ASPECT);
  const laurel = Math.min(w * 0.46, ring * 0.58);

  return (
    ring +
    gap +
    laurel +
    gap +
    nameSize +
    2 +
    roleSize +
    gap +
    pillH +
    (includeYou ? youSize + 2 : 0) +
    s(6)
  );
}

export function computePodiumSlotMetrics(
  rank: 1 | 2 | 3,
  card: PodiumSlotSize,
  s: (n: number) => number
): PodiumSlotMetrics {
  const w = card.width;
  const h = card.height;

  const gap = Math.max(3, h * 0.018);
  const nameSize = Math.max(10, w * 0.1);
  const roleSize = Math.max(8, w * 0.08);
  const youSize = Math.max(8, roleSize * 0.9);
  const pillW = w * 0.92;
  const pillH = Math.max(12, pillW / POINTS_PILL_ASPECT);

  let ring = Math.min(podiumHeroRingTarget(rank, s), w * 0.98);

  for (let pass = 0; pass < 4; pass++) {
    const stack = estimateStackHeight(ring, w, s);
    if (stack <= h) break;
    ring *= (h / stack) * 0.97;
  }

  const fixedStack = estimateStackHeight(0, w, s);
  const maxRing = Math.max(0, h - fixedStack);
  ring = Math.min(ring, maxRing);
  if (maxRing >= s(40)) {
    ring = Math.max(ring, s(40));
  }
  const laurel = Math.min(w * 0.46, ring * 0.58);

  return {
    laurel,
    ring,
    avatar: ring * 0.86,
    pillW,
    pillH,
    nameSize,
    roleSize,
    gap,
    youSize
  };
}

/** Ensures every rank card zone fits avatar + laurel + full text stack. */
export function podiumMinHeight(s: (n: number) => number): number {
  const sampleW = s(130);
  let maxTotal = 0;

  for (const rank of [1, 2, 3] as const) {
    const ring = podiumHeroRingTarget(rank, s);
    const stack = estimateStackHeight(ring, sampleW, s);
    const total = stack / layoutCardShare(rank);
    maxTotal = Math.max(maxTotal, total);
  }

  return Math.ceil(maxTotal);
}
