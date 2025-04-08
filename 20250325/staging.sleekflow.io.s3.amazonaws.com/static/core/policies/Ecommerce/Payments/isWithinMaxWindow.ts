import { Moment } from "moment";

export function isWithinMaxWindow(
  testDate: Moment,
  now: Moment,
  maxDays: number
) {
  return testDate.isBefore(now) && now.diff(testDate, "days") < maxDays;
}
