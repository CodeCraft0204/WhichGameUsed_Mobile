import type { ImageSourcePropType } from 'react-native';
import { databaseIcons } from '@/constants/databaseContent';
import {
  cardDescription,
  cardToTags,
  searchApprovedCards,
  type CardSummary
} from '@/lib/cards';

export type CameraCardSearchResult = {
  key: string;
  title: string;
  description: string;
  tags: string[];
  cardImage: ImageSourcePropType;
  imageUrl: string | null;
};

function toSearchResult(card: CardSummary): CameraCardSearchResult {
  return {
    key: card.id,
    title: card.title.replace(/\n/g, ' '),
    description: cardDescription(card),
    tags: cardToTags(card),
    cardImage: databaseIcons.recordMantle,
    imageUrl: card.imageUrl
  };
}

export async function searchCameraCardCatalog(
  query: string
): Promise<{ items: CameraCardSearchResult[]; error: string | null }> {
  const { items, error } = await searchApprovedCards(query, 25);
  if (error) return { items: [], error };
  return { items: items.map(toSearchResult), error: null };
}
