import moment from "moment";
import { T } from "ramda";

export function withLoop<T, R>(
  callback: (
    item: T,
    index: number,
    all: T[],
    props: { isFirst: boolean; isLast: boolean }
  ) => R
) {
  return (item: T, index: number, all: T[]) =>
    callback(item, index, all, {
      isFirst: index === 0,
      isLast: index === all.length - 1,
    });
}

export function getMomentComparator(options: {
  format?: string;
  invalidValueMeans?: "LESS" | "GREATER" | "EQUAL";
}) {
  const createMoment = (date: string) => moment(date, options.format);

  return (dateA: string, dateB: string) => {
    const momentA = createMoment(dateA);
    const momentB = createMoment(dateB);
    if (momentA.isValid() && momentB.isValid()) {
      if (momentA.isSame(momentB)) {
        return 0;
      }
      return momentA.isBefore(momentB) ? -1 : 1;
    }
    if (!momentA.isValid() && !momentB.isValid()) {
      return 0;
    }

    const invalidValueMeans = options.invalidValueMeans;
    if ([undefined, "EQUAL"].includes(invalidValueMeans)) {
      return 0;
    }

    if (!momentA.isValid()) {
      switch (invalidValueMeans) {
        case "LESS":
          return -1;
        case "GREATER":
          return 1;
      }
    } else {
      switch (invalidValueMeans) {
        case "LESS":
          return 1;
        case "GREATER":
          return -1;
      }
    }
    return 0;
  };
}

/**
 * For use preferrably in the immer producers, as it shallow copies the input
 * @param predicate
 * @param item
 * @param list
 */
export function updateOrAppendShallow<T>(
  predicate: (x: T) => boolean,
  item: T,
  list: Array<T>
) {
  const index = list.findIndex(predicate);
  if (index === -1) {
    return [...list, item];
  }
  const updated = [...list];
  updated[index] = item;
  return updated;
}
