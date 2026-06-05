import {
  databaseFeaturedRecords,
  databaseRecentRecords,
  type DatabaseRecord
} from '@/constants/databaseContent';

export type CameraCardSearchResult = {
  key: string;
  title: string;
  description: string;
  tags: string[];
  cardImage: number;
};

function toSearchResult(record: DatabaseRecord): CameraCardSearchResult {
  return {
    key: record.key,
    title: record.title.replace(/\n/g, ' '),
    description: record.description,
    tags: record.tags,
    cardImage: record.cardImage
  };
}

const catalog: CameraCardSearchResult[] = [
  ...databaseFeaturedRecords.map(toSearchResult),
  ...databaseRecentRecords.map(toSearchResult)
];

export function searchCameraCardCatalog(query: string): CameraCardSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;

  return catalog.filter((item) => {
    const haystack = [item.title, item.description, ...item.tags].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
