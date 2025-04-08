import dayjs, { Dayjs } from 'dayjs';

export function getPreviousPeriod(
  start: string | Dayjs,
  end: string | Dayjs,
  dateFormat = 'YYYY-MM-DD',
) {
  const diffDays = dayjs(end).diff(start, 'days') + 1;
  const from = dayjs(start).subtract(diffDays, 'days').format(dateFormat);
  const to = dayjs(end).subtract(diffDays, 'days').format(dateFormat);
  return { from, to };
}
