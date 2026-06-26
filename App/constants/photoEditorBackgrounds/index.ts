/** Photo editor canvas backgrounds (Photo Editor/background). */

import type { ImageSourcePropType } from 'react-native';
import { chunk0 } from './chunks/chunk0';
import { chunk1 } from './chunks/chunk1';
import { chunk2 } from './chunks/chunk2';
import { chunk3 } from './chunks/chunk3';
import { chunk4 } from './chunks/chunk4';
import { chunk5 } from './chunks/chunk5';

export const photoBackgrounds = {
  ...chunk0,
  ...chunk1,
  ...chunk2,
  ...chunk3,
  ...chunk4,
  ...chunk5,
} as const;

export type PhotoBackgroundImageKey = keyof typeof photoBackgrounds;
export type PhotoBackgroundKey = 'parchment' | PhotoBackgroundImageKey;
export const DEFAULT_PHOTO_BACKGROUND: PhotoBackgroundKey = 'parchment';
export const photoBackgroundImageKeys = Object.keys(photoBackgrounds) as PhotoBackgroundImageKey[];

export const photoBackgroundLabels: Record<PhotoBackgroundKey, string> = {
  parchment: 'Parchment (default)',
  background_1: 'Background (1)',
  background_1_2: 'Background (1)',
  background_10: 'Background (10)',
  background_11: 'Background (11)',
  background_12: 'Background (12)',
  background_13: 'Background (13)',
  background_14: 'Background (14)',
  background_15: 'Background (15)',
  background_16: 'Background (16)',
  background_17: 'Background (17)',
  background_18: 'Background (18)',
  background_19: 'Background (19)',
  background_2: 'Background (2)',
  background_2_2: 'Background (2)',
  background_20: 'Background (20)',
  background_21: 'Background (21)',
  background_22: 'Background (22)',
  background_23: 'Background (23)',
  background_24: 'Background (24)',
  background_25: 'Background (25)',
  background_26: 'Background (26)',
  background_27: 'Background (27)',
  background_28: 'Background (28)',
  background_29: 'Background (29)',
  background_3: 'Background (3)',
  background_3_2: 'Background (3)',
  background_30: 'Background (30)',
  background_31: 'Background (31)',
  background_32: 'Background (32)',
  background_33: 'Background (33)',
  background_34: 'Background (34)',
  background_35: 'Background (35)',
  background_36: 'Background (36)',
  background_37: 'Background (37)',
  background_38: 'Background (38)',
  background_39: 'Background (39)',
  background_4: 'Background (4)',
  background_4_2: 'Background (4)',
  background_5: 'Background (5)',
  background_5_2: 'Background (5)',
  background_6: 'Background (6)',
  background_6_2: 'Background (6)',
  background_7: 'Background (7)',
  background_7_2: 'Background (7)',
  background_8: 'Background (8)',
  background_9: 'Background (9)',
};

export const photoBackgroundPickerKeys: PhotoBackgroundKey[] = [
  'parchment',
  ...photoBackgroundImageKeys
];

export function photoBackgroundSource(key: PhotoBackgroundKey): ImageSourcePropType | null {
  if (key === 'parchment') return null;
  if (Object.prototype.hasOwnProperty.call(photoBackgrounds, key)) {
    return photoBackgrounds[key as PhotoBackgroundImageKey];
  }
  return null;
}
