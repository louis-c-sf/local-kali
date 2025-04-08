import moment from "moment-timezone";

export function getUtcMoment(utcOffset: number, date: string) {
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    return;
  }
  return momentDate.utcOffset(utcOffset, true);
}
