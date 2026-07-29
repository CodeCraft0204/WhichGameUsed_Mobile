import type { ImageSourcePropType } from 'react-native';
import { educationIcons } from '@/constants/educationContent';

export type EducationDocumentKind = 'pdf' | 'image';

export type EducationDocument = {
  id: string;
  title: string;
  subtitle?: string;
  kind: EducationDocumentKind;
  /** Bundled asset module from require(...). Used on iOS/Android. */
  assetModule?: number;
  /**
   * Static web path under /public (Expo serves these with correct PDF MIME).
   * Prefer this on web — Metro asset URLs often fail Chrome's PDF viewer.
   */
  webPublicPath?: string;
  /** Remote https URL (PDF or image). */
  remoteUri?: string;
  /** Static image source for timeline originals. */
  imageSource?: ImageSourcePropType;
};

/**
 * In-app originals / PDF guides.
 * Babe Ruth story is the founding case study PDF bundled under education assets.
 */
export const educationDocuments: Record<string, EducationDocument> = {
  'babe-and-the-big-break': {
    id: 'babe-and-the-big-break',
    title: 'Babe and The Big Break: How We Rewrote Game-Used Card History',
    subtitle:
      'This platform started with a card, a question, and a search for answers. One year later, we Photo Matched Babe Ruth’s best-known game-used jersey card to the 1926 World Series.',
    kind: 'pdf',
    assetModule: require('@/assets/figma/education/babe_ruth_1926_home_jersey.pdf'),
    webPublicPath: '/education/babe-and-the-big-break.pdf'
  },
  'game-used-hobby-timeline-original': {
    id: 'game-used-hobby-timeline-original',
    title: 'Original timeline',
    subtitle: 'Pinch or scroll to explore the original timeline art.',
    kind: 'image',
    imageSource: educationIcons.timelineHistory
  }
};

export function getEducationDocument(id: string | undefined | null): EducationDocument | null {
  if (!id) return null;
  return educationDocuments[id] ?? null;
}

export const BABE_RUTH_DOCUMENT_ID = 'babe-and-the-big-break';
export const TIMELINE_ORIGINAL_DOCUMENT_ID = 'game-used-hobby-timeline-original';
