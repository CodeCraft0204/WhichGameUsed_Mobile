import type { ImageSourcePropType } from 'react-native';

/** Client-provided reaction GIFs for success / acknowledgment feedback. */
export const responseGifCatalog = [
  {
    key: 'acknowledge',
    source: require('@/assets/Gif/1.gif') as ImageSourcePropType,
    label: 'On it'
  },
  {
    key: 'approved',
    source: require('@/assets/Gif/2.gif') as ImageSourcePropType,
    label: 'Approved'
  },
  {
    key: 'watching',
    source: require('@/assets/Gif/3.gif') as ImageSourcePropType,
    label: 'Watching'
  },
  {
    key: 'case_note',
    source: require('@/assets/Gif/4.gif') as ImageSourcePropType,
    label: 'Case note'
  },
  {
    key: 'deal_with_it',
    source: require('@/assets/Gif/5.gif') as ImageSourcePropType,
    label: 'Case closed'
  }
] as const;

export type ResponseGifKey = (typeof responseGifCatalog)[number]['key'];

/** Prefer celebratory / affirming clips for successful gifts & submissions. */
const SUCCESS_KEYS: ResponseGifKey[] = ['acknowledge', 'approved', 'deal_with_it'];

export function pickResponseGif(
  mood: 'success' | 'any' = 'success'
): (typeof responseGifCatalog)[number] {
  if (mood === 'any') {
    return responseGifCatalog[Math.floor(Math.random() * responseGifCatalog.length)]!;
  }
  const pool = responseGifCatalog.filter((g) => SUCCESS_KEYS.includes(g.key));
  return pool[Math.floor(Math.random() * pool.length)] ?? responseGifCatalog[0]!;
}
