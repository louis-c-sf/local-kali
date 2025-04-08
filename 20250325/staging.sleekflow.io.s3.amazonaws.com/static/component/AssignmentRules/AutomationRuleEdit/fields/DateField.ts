import moment, { Moment } from "moment";
import { AbstractConditionField } from "./AbstractConditionField";
import {
  IntervalEnum,
  IntervalType,
  isInterval,
  isPeriod,
  isWeekdays,
  PeriodType,
  WeekdaysType,
} from "./types";
import { getFirstConditionValue, parseDate } from "./helpers";
import {
  CompoundConditionType,
  flattenCondition,
} from "../../../../types/AssignmentRuleType";
import { TFunction } from "i18next";

//todo break down to subclasses
export class DateField extends AbstractConditionField {
  private date: Moment | undefined;
  private intervalType: IntervalEnum = "DAY";
  private intervalNumber: number | undefined;
  private period: PeriodType | undefined;
  private weekdays: WeekdaysType = [];

  toInputValueType():
    | Moment
    | IntervalType
    | PeriodType
    | WeekdaysType
    | undefined {
    switch (true) {
      case this.isDatePeriod():
        return this.getPeriod();

      case this.isDateInterval():
      case this.isToday():
        return this.getInterval();

      case this.isSingleDate():
        return this.date;
    }
  }

  getDate() {
    const momentValue = this.date ? moment(this.date) : undefined;
    return momentValue?.isValid() ? momentValue : undefined;
  }

  getInterval(): IntervalType {
    return { type: this.intervalType, number: this.intervalNumber ?? 0 };
  }

  getPeriod(): PeriodType | undefined {
    return this.period;
  }

  getWeekDays(): WeekdaysType {
    return this.weekdays;
  }

  isMultiple(): boolean {
    return false;
  }

  isDateInterval() {
    return [
      "DateBeforeDayAgo",
      "DateAfterDayAgo",
      "IsExactlyDaysBefore",
      "IsExactlyDaysAfter",
    ].includes(this.getFormConditionOperator());
  }

  isToday() {
    return "IsToday" === this.getFormConditionOperator();
  }

  isDatePeriod() {
    return ["IsBetween", "IsNotBetween"].includes(
      this.getFormConditionOperator()
    );
  }

  isWeekDays() {
    return ["DayOfWeek"].includes(this.getFormConditionOperator());
  }

  isSingleDate() {
    return !this.isDatePeriod() && !this.isDateInterval() && !this.isWeekDays();
  }

  isTimeOnly() {
    return this.fieldType.toLowerCase() === "datetime";
  }

  toConditionType(): CompoundConditionType {
    if (this.isToday()) {
      return {
        conditionOperator: "IsToday",
        values: [""],
        fieldName: this.fieldName,
        nextOperator: "And",
      };
    } else if (this.isDateInterval()) {
      if (!this.intervalNumber) {
        return {
          conditionOperator: this.getFormConditionOperator(),
          values: [""],
          fieldName: this.fieldName,
          nextOperator: "And",
        };
      }
      let daysAmount = this.intervalNumber as number;
      switch (this.intervalType) {
        case "MONTH":
          daysAmount = this.intervalNumber * 30;
          break;
        case "WEEK":
          daysAmount = this.intervalNumber * 7;
          break;
      }

      const timeValueTypesMap = {
        SECOND: "Seconds",
        MINUTE: "Minutes",
        HOUR: "Hours",
        DAY: "Days",
        WEEK: "Days",
        MONTH: "Days",
      };

      return {
        conditionOperator: this.getFormConditionOperator(),
        values: [daysAmount.toString()],
        fieldName: this.fieldName,
        timeValueType: timeValueTypesMap[this.intervalType as string] ?? "Days",
        nextOperator: "And",
      };
    } else if (this.isDatePeriod()) {
      return {
        conditionOperator: this.getFormConditionOperator(),
        values: [
          this.period?.from.clone().utcOffset(0, false).toISOString(false) ??
            "",
          this.period?.to.clone().utcOffset(0, false).toISOString(false) ?? "",
        ],
        fieldName: this.fieldName,
        nextOperator: "And",
      };
    } else if (this.isWeekDays()) {
      return {
        conditionOperator: "DayOfWeek",
        values: this.getWeekDays(),
        fieldName: this.fieldName,
        nextOperator: "And",
      };
    } else {
      return {
        conditionOperator: this.getFormConditionOperator(),
        values: [this.date?.toISOString(false) ?? ""],
        fieldName: this.fieldName,
        nextOperator: "And",
      };
    }
  }

  isRequireInput() {
    if (this.isToday()) {
      return true;
    }
    return super.isRequireInput();
  }

  validate(t: TFunction) {
    if (!this.isRequireInput()) {
      return;
    }
    switch (true) {
      case this.isToday():
        break;
      case this.isDateInterval():
        if (!this.intervalType) {
          return t("automation.field.interval.error.type.required");
        }
        if (
          isNaN(this.intervalNumber as number) ||
          Number(this.intervalNumber) < 1
        ) {
          return t("automation.field.interval.error.amount.required");
        }
        break;

      case this.isWeekDays():
        if (this.getWeekDays().length === 0) {
          return t("automation.field.interval.error.amount.weekdays");
        }
        break;

      case this.isDatePeriod():
        if (!isPeriod(this.period)) {
          return t("automation.field.interval.error.amount.period");
        }
        if (!this.period.from.isValid()) {
          return t("automation.field.interval.error.amount.dateStart");
        }
        if (!this.period.to.isValid()) {
          return t("automation.field.interval.error.amount.dateEnd");
        }
        break;

      case this.isSingleDate():
        if (!this.date) {
          return t("automation.field.interval.error.amount.date.required");
        }
        if (!this.date.isValid()) {
          return t("automation.field.interval.error.amount.date.invalid");
        }
        break;
    }
  }

  protected parseConditionToValue(
    condition: CompoundConditionType
  ): Moment | IntervalType | PeriodType | WeekdaysType {
    if (this.isToday()) {
      return { number: 0, type: "DAY" };
    } else if (this.isDateInterval()) {
      const [firstCondition] = flattenCondition(condition);
      if (!firstCondition || !firstCondition.values) {
        return { number: 1, type: "DAY" };
      }
      if (firstCondition.values.length === 0) {
        return { number: 1, type: "DAY" };
      }
      let amount = Number(firstCondition.values[0]);
      if (isNaN(amount)) {
        amount = 0;
      }

      if (
        firstCondition.timeValueType === undefined ||
        firstCondition.timeValueType === "Days"
      ) {
        switch (true) {
          case amount === 0:
            return { number: amount, type: "DAY" };

          case amount % 30 === 0:
            return { number: amount / 30, type: "MONTH" };

          case amount % 7 === 0:
            return { number: amount / 7, type: "WEEK" };

          default:
            return { number: amount, type: "DAY" };
        }
      } else {
        switch (firstCondition.timeValueType) {
          case "Hours":
            return { number: amount, type: "HOUR" };
          case "Minutes":
            return { number: amount, type: "MINUTE" };
          case "Seconds":
            return { number: amount, type: "SECOND" };
          default:
            return { number: amount, type: "DAY" };
        }
      }
    } else if (this.isDatePeriod()) {
      const rangeCondition = condition;

      if (!rangeCondition?.values) {
        return { from: moment.utc(), to: moment.utc() };
      }
      const values = Array.isArray(rangeCondition.values)
        ? rangeCondition.values
        : [];
      const [from, to] = values;

      return {
        from: moment.utc(from),
        to: moment.utc(to),
      };
    } else if (this.isWeekDays()) {
      return condition.values as WeekdaysType;
    } else {
      const date = getFirstConditionValue(condition);

      return moment.utc(date);
    }
  }

  protected updateValue(
    newValue: IntervalType | Moment | PeriodType | string
  ): void {
    if (isPeriod(newValue)) {
      this.period = newValue;
    } else if (isInterval(newValue)) {
      this.intervalNumber = newValue.number;
      this.intervalType = newValue.type;
    } else if (isWeekdays(newValue)) {
      this.weekdays = newValue;
    } else {
      this.date = parseDate(newValue);
    }
  }
}
