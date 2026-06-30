import type { CardResearchRatings } from '@/lib/card-research-ratings';
import { cardDetailCopy } from '@/constants/cardDetailCopy';

export type ConfidenceLevel = 'none' | 'low' | 'fair' | 'good' | 'high';

export function computeFinalScore(ratings: CardResearchRatings): number | null {
  const { adminRating, communityRating } = ratings;
  if (adminRating != null && communityRating != null) {
    return Math.round(((adminRating + communityRating) / 2) * 10) / 10;
  }
  if (adminRating != null) return adminRating;
  if (communityRating != null) return communityRating;
  return null;
}

export function confidenceFromScore(score: number | null): ConfidenceLevel {
  if (score == null || score <= 0) return 'none';
  if (score < 1.5) return 'low';
  if (score < 3) return 'fair';
  if (score < 4) return 'good';
  return 'high';
}

export function confidenceLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'low':
      return cardDetailCopy.confidenceLow;
    case 'fair':
      return cardDetailCopy.confidenceFair;
    case 'good':
      return cardDetailCopy.confidenceGood;
    case 'high':
      return cardDetailCopy.confidenceHigh;
    default:
      return cardDetailCopy.confidenceNone;
  }
}

export function confidenceProgress(score: number | null): number {
  if (score == null || score <= 0) return 0;
  return Math.min(1, Math.max(0, score / 5));
}
