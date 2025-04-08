import { format, parseISO } from 'date-fns';

import { isWithinLast24Hours } from './isWithinLast24Hours';

export const adaptiveFormat = (
  value: number | string | Date,
  sameDateFormat: string,
  diffDateFormat: string,
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    value = parseISO(value as string);
  }

  if (isWithinLast24Hours(value as number | Date)) {
    return format(value, sameDateFormat);
  }

  return format(value, diffDateFormat);
};
