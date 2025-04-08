import React from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import { Moment } from "moment";
import {
  toDatePickerDate,
  toUserUtcDate,
} from "../AssignmentRules/AutomationRuleEdit/fields/helpers";

interface DatePickerUTCAwareProps
  extends Omit<ReactDatePickerProps, "onChange" | "value" | "selected"> {
  selected: Moment | undefined;
  utcOffset: number;
  onChange: (date: Moment | null) => void;
}

function DatePickerUtcAware<TProps extends DatePickerUTCAwareProps>(
  props: TProps
) {
  const { onChange, utcOffset, selected, ...safeProps } = props;

  return (
    <ReactDatePicker
      selected={
        selected ? toDatePickerDate(selected.clone(), utcOffset) : undefined
      }
      onChange={(date) => {
        const dateWrapped = date ? toUserUtcDate(date, utcOffset) : null;
        onChange(dateWrapped);
      }}
      {...safeProps}
    />
  );
}

export default DatePickerUtcAware;
