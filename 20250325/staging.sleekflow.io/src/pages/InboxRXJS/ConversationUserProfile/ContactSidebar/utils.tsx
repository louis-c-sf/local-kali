import { Hashtag } from '@/api/types';

export const LabelColorOrders = [
  'Pink',
  'Red',
  'Pink',
  'Yellow',
  'Green',
  'Cyan',
  'Grey',
  'Blue',
];

export const SortingLabels = (labels: Hashtag[]) => {
  return labels.sort((prev, next) => {
    // First, sort by color order
    const colorIndexPrev = LabelColorOrders.indexOf(prev.hashTagColor);
    const colorIndexNext = LabelColorOrders.indexOf(next.hashTagColor);
    if (colorIndexPrev !== colorIndexNext) {
      return colorIndexPrev - colorIndexNext;
    }

    // If colors are the same, sort alphabetically by color name
    return prev.hashtag.localeCompare(next.hashtag);
  });
};
