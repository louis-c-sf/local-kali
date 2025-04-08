import { IntervalType, isInterval } from "./types";
import moment, { Moment } from "moment";
import {
  CompoundConditionType,
  flattenCondition,
} from "../../../../types/AssignmentRuleType";

export function parseInterval(
  rawValue: IntervalType | Moment | string
): IntervalType {
  if (!isInterval(rawValue)) {
    return { number: 1, type: "DAY" };
  }
  const number = Number(rawValue.number);
  const type = rawValue.type;
  return { number, type };
}

export function parseDate(rawValue: IntervalType | Moment | string): Moment {
  if (
    (moment.isMoment(rawValue) && rawValue.isValid()) ||
    typeof rawValue === "string"
  ) {
    const momentParsed = moment(rawValue);
    return momentParsed.isValid() ? momentParsed : moment();
  }
  return moment();
}

export function getAllConditionValues(
  condition: CompoundConditionType
): string[] {
  const conditions = flattenCondition(condition);
  return conditions.reduce<string[]>((acc, c) => {
    let values = (c?.values ?? [])
      .filter((v) => v !== undefined)
      .filter((v) => !acc.includes(v));
    return acc.concat(values);
  }, []);
}

export function getFirstConditionValue(
  condition: CompoundConditionType
): string | undefined {
  const values = flattenCondition(condition)[0];
  return values.values ? values.values[0] : undefined;
}

export function toDatePickerDate(input: Moment, userUtcOffset: number): Date {
  const localizedStamp = input
    .clone()
    .utcOffset(userUtcOffset, false)
    .format("YYYY-MM-DDTHH:mm:ss");

  return new Date(localizedStamp);
}

export function toUserUtcDate(input: Date, userUtcOffset: number): Moment {
  return moment(input)
    .utcOffset(userUtcOffset, true)
    .utc();
}
