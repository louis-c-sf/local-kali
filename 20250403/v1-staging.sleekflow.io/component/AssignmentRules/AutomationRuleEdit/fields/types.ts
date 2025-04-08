import { isMoment, Moment } from "moment";

export const intervalTypes = [
  "SECOND",
  "MINUTE",
  "HOUR",
  "DAY",
  "WEEK",
  "MONTH",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;
export type IntervalEnum = typeof intervalTypes[number];

export type IntervalType = { type: IntervalEnum; number: number };

export type PeriodType = { from: Moment; to: Moment };
export type WeekdaysType = string[];

export function isPeriod(p: PeriodType | any): p is PeriodType {
  if (typeof p === "object") {
    return isMoment(p.from) && isMoment(p.to);
  }
  return false;
}

export function isWeekdays(x: any): x is WeekdaysType {
  if (!Array.isArray(x)) {
    return false;
  }
  const valid = "1234567".split("");
  if (x.some((v) => !valid.includes(v))) {
    return false;
  }
  return true;
}

export function isInterval(x: any): x is IntervalType {
  if (typeof x === "object") {
    return !isNaN(Number(x.number)) && intervalTypes.includes(x.type);
  }
  return false;
}
