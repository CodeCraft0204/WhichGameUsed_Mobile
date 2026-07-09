import { figmaColors } from '@/constants/figmaColors';
import type { WantedStatusTag } from '@/lib/most-wanted';

export type MwContributionStatus = 'pending_review' | 'approved' | 'needs_more_info' | 'rejected';

export function huntCardBorder(status: string, tags: WantedStatusTag[]): string {
  if (status === 'solved') return figmaColors.borderStrong;
  if (status === 'near_solved' || tags.includes('near_solved')) return figmaColors.success;
  if (tags.includes('high_value')) return figmaColors.accent;
  return figmaColors.borderLight;
}

export function huntCardBackground(status: string, tags: WantedStatusTag[]): string {
  if (status === 'near_solved' || tags.includes('near_solved')) return figmaColors.successBg;
  if (tags.includes('high_value')) return figmaColors.cardFeaturedBg;
  return figmaColors.cream;
}

export function contributionStatusColors(status: MwContributionStatus) {
  switch (status) {
    case 'approved':
      return { bg: figmaColors.successBg, border: figmaColors.success, text: figmaColors.success };
    case 'needs_more_info':
      return { bg: figmaColors.infoBg, border: figmaColors.accent, text: figmaColors.brown };
    case 'rejected':
      return { bg: figmaColors.errorBg, border: figmaColors.errorBorder, text: figmaColors.error };
    default:
      return { bg: figmaColors.surfaceMuted, border: figmaColors.borderLight, text: figmaColors.gray };
  }
}

export function rankingRankStyle(rank: number) {
  if (rank === 1) {
    return { bg: figmaColors.surfaceHighlight, border: figmaColors.accent, label: figmaColors.accentStrong };
  }
  if (rank === 2) {
    return { bg: figmaColors.cardFeaturedBg, border: figmaColors.borderStrong, label: figmaColors.brown };
  }
  if (rank === 3) {
    return { bg: figmaColors.cardRecentBg, border: figmaColors.border, label: figmaColors.taupe };
  }
  return { bg: figmaColors.cream, border: figmaColors.borderLight, label: figmaColors.gray };
}
