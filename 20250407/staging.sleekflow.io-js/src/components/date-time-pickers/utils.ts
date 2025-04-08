import { Dayjs, ManipulateType } from 'dayjs';

/**
 * Create a range of Day.js dates between a start and end date.
 *
 * ```js
 * dayjsRange(dayjs('2021-04-03'), dayjs('2021-04-05'), 'day');
 * // => [dayjs('2021-04-03'), dayjs('2021-04-04'), dayjs('2021-04-05')]
 * ```
 */
export function dayjsRange(
  start: Dayjs,
  end: Dayjs,
  unit: ManipulateType = 'day',
  interval = 1,
) {
  const range = [];
  let current = start.clone();
  const endTime = end.clone();

  // For time ranges, ensure we're working with just the time part
  if (unit === 'minute' || unit === 'hour') {
    current = current.startOf('day');
    endTime.endOf('day');
  }

  while (!current.isAfter(endTime)) {
    range.push(current.clone());
    current = current.add(interval, unit);
  }

  return range;
}
