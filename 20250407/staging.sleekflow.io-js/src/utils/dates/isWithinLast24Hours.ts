import { differenceInSeconds } from 'date-fns';

export const isWithinLast24Hours = (date: number | Date): boolean => {
  const now = new Date();

  return Math.abs(differenceInSeconds(date, now)) < 24 * 3600;
};
