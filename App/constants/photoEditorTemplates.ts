import { photoFrames, photoShapes, type PhotoFrameKey } from '@/constants/photoEditorAssets';

export type PhotoSlotDef = {
  id: string;
  frame: PhotoFrameKey;
  /** Percent of canvas (0–100). */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Photo inset inside frame as % of slot box. */
  insetTop?: number;
  insetLeft?: number;
  insetRight?: number;
  insetBottom?: number;
};

export type TextSlotDef = {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  placeholder: string;
  fontSize: number;
};

export type DecorShapeDef = {
  asset: keyof typeof photoShapes;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type PhotoTemplate = {
  id: string;
  name: string;
  description: string;
  previewFrame: PhotoFrameKey;
  canvasWidth: number;
  canvasHeight: number;
  slots: PhotoSlotDef[];
  textSlots: TextSlotDef[];
  decor?: DecorShapeDef[];
};

export const BLANK_TEMPLATE_ID = 'blank';

export const blankTemplateMeta = {
  id: BLANK_TEMPLATE_ID,
  name: 'Start from blank',
  description: 'Empty canvas — add photos, frames, and text. Drag, resize, and arrange everything yourself.'
} as const;

export const photoEditorTemplates: PhotoTemplate[] = [
  {
    id: 'polaroid-single',
    name: 'Polaroid',
    description: 'Single polaroid frame — great for one card photo.',
    previewFrame: 'polaroid',
    canvasWidth: 360,
    canvasHeight: 480,
    slots: [
      {
        id: 'main',
        frame: 'polaroid',
        left: 18,
        top: 12,
        width: 64,
        height: 52,
        insetTop: 4,
        insetLeft: 7,
        insetRight: 5,
        insetBottom: 23
      }
    ],
    textSlots: [
      { id: 'caption', left: 10, top: 68, width: 80, height: 12, placeholder: 'Add a caption…', fontSize: 16 }
    ]
  },
  {
    id: 'kodak-single',
    name: 'Kodak frame',
    description: 'Classic kodak-style frame for a featured image.',
    previewFrame: 'kodak',
    canvasWidth: 360,
    canvasHeight: 480,
    slots: [
      {
        id: 'main',
        frame: 'kodak',
        left: 14,
        top: 10,
        width: 72,
        height: 58,
        insetTop: 14,
        insetLeft: 2,
        insetRight: 1,
        insetBottom: 13
      }
    ],
    textSlots: [
      { id: 'caption', left: 10, top: 72, width: 80, height: 12, placeholder: 'Research notes…', fontSize: 15 }
    ]
  },
  {
    id: 'dual-paper',
    name: 'Dual paper',
    description: 'Two paper frames side by side — card + jersey screenshot.',
    previewFrame: 'paper1',
    canvasWidth: 360,
    canvasHeight: 480,
    slots: [
      {
        id: 'left',
        frame: 'paper1',
        left: 6,
        top: 14,
        width: 44,
        height: 38,
        insetTop: 6,
        insetLeft: 5,
        insetRight: 6,
        insetBottom: 8
      },
      {
        id: 'right',
        frame: 'paper2',
        left: 50,
        top: 14,
        width: 44,
        height: 38,
        insetTop: 4,
        insetLeft: 3,
        insetRight: 3,
        insetBottom: 3
      }
    ],
    textSlots: [
      { id: 'caption', left: 8, top: 56, width: 84, height: 14, placeholder: 'Match evidence summary…', fontSize: 15 }
    ]
  },
  {
    id: 'triple-stack',
    name: 'Triple stack',
    description: 'Three stacked frames for multiple proof images.',
    previewFrame: 'paper3',
    canvasWidth: 360,
    canvasHeight: 520,
    slots: [
      {
        id: 'top',
        frame: 'paper1',
        left: 22,
        top: 4,
        width: 56,
        height: 26,
        insetTop: 7,
        insetLeft: 5,
        insetRight: 5,
        insetBottom: 4
      },
      {
        id: 'mid',
        frame: 'paper2',
        left: 22,
        top: 32,
        width: 56,
        height: 26,
        insetTop: 4,
        insetLeft: 3,
        insetRight: 3,
        insetBottom: 4
      },
      {
        id: 'bottom',
        frame: 'paper3',
        left: 22,
        top: 60,
        width: 56,
        height: 26,
        insetTop: 8,
        insetLeft: 6,
        insetRight: 3,
        insetBottom: 6
      }
    ],
    textSlots: [
      { id: 'caption', left: 8, top: 88, width: 84, height: 10, placeholder: 'Title or summary…', fontSize: 14 }
    ]
  },
  {
    id: 'research-board',
    name: 'Research board',
    description: 'Hero frame plus two supporting images.',
    previewFrame: 'kodak',
    canvasWidth: 360,
    canvasHeight: 520,
    slots: [
      {
        id: 'hero',
        frame: 'kodak',
        left: 20,
        top: 6,
        width: 60,
        height: 40,
        insetTop: 13,
        insetLeft: 2,
        insetRight: 2,
        insetBottom: 13
      },
      {
        id: 'support-a',
        frame: 'paper4',
        left: 8,
        top: 50,
        width: 40,
        height: 28,
        insetTop: 8,
        insetLeft: 6,
        insetRight: 6,
        insetBottom: 7
      },
      {
        id: 'support-b',
        frame: 'paper1',
        left: 52,
        top: 50,
        width: 40,
        height: 28,
        insetTop: 7,
        insetLeft: 4,
        insetRight: 6,
        insetBottom: 8
      }
    ],
    textSlots: [
      { id: 'title', left: 8, top: 82, width: 84, height: 8, placeholder: 'Headline…', fontSize: 17 },
      { id: 'body', left: 8, top: 90, width: 84, height: 8, placeholder: 'Supporting details…', fontSize: 14 }
    ]
  },
  {
    id: 'card-story',
    name: 'Card story',
    description: 'Polaroid with tape accent and long caption area.',
    previewFrame: 'polaroid',
    canvasWidth: 360,
    canvasHeight: 500,
    slots: [
      {
        id: 'main',
        frame: 'polaroid',
        left: 20,
        top: 10,
        width: 60,
        height: 48,
        insetTop: 4,
        insetLeft: 7,
        insetRight: 5,
        insetBottom: 22
      }
    ],
    textSlots: [
      { id: 'title', left: 10, top: 62, width: 80, height: 8, placeholder: 'Card title…', fontSize: 17 },
      { id: 'body', left: 10, top: 72, width: 80, height: 20, placeholder: 'Tell the story behind this match…', fontSize: 14 }
    ]
  }
];

export function getPhotoTemplate(id: string): PhotoTemplate | undefined {
  return photoEditorTemplates.find((tpl) => tpl.id === id);
}
