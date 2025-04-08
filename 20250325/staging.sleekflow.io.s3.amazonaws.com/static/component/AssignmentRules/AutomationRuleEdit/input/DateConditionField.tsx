import { DateField } from "../fields/DateField";
import ReactDatePicker from "react-datepicker";
import React from "react";
import { Dropdown, GridColumn, Input } from "semantic-ui-react";
import DatePickerUtcAware from "../../../shared/DatePickerUTCAware";
import moment from "moment";
import { IntervalEnum, PeriodType } from "../fields/types";
import { useTranslation } from "react-i18next";
import styles from "./DateConditionField.module.css";

export function DateConditionField(props: {
  field: DateField;
  onChange: (value: any) => void;
  utcOffset: number;
}) {
  const { field, onChange, utcOffset } = props;
  if (field.isToday()) {
    return <div></div>;
  }
  if (field.isDateInterval()) {
    return <DateIntervalInput dateField={field} onChange={onChange} />;
  } else if (field.isDatePeriod()) {
    return (
      <DatePeriodInput
        onChange={onChange}
        field={field}
        utcOffset={utcOffset}
      />
    );
  } else if (field.isWeekDays()) {
    return <WeekDaysInput onChange={onChange} field={field} />;
  }

  const singleDate = field.getDate();
  return (
    <GridColumn width={"4"}>
      <ReactDatePicker
        onChange={(date) => {
          onChange(
            moment(date ? moment(date, "dd-MM-YYYY").startOf("day") : moment())
          );
        }}
        selected={
          singleDate ? moment(singleDate, "dd-MM-YYYY").toDate() : undefined
        }
        onBlur={() => {
          onChange(
            moment(
              singleDate
                ? moment(singleDate.toDate(), "dd-MM-YYYY").startOf("day")
                : moment()
            )
          );
        }}
        dateFormat={"dd.MM.yyyy"}
      />
    </GridColumn>
  );
}

function DateIntervalInput(props: {
  dateField: DateField;
  onChange: (value: any) => void;
}) {
  const { t } = useTranslation();
  const { onChange, dateField } = props;
  const TYPE_CHOICES_FULL: Array<[IntervalEnum, string]> = [
    ["SECOND", t("automation.rule.type.date.second")],
    ["MINUTE", t("automation.rule.type.date.minute")],
    ["HOUR", t("automation.rule.type.date.hour")],
    ["DAY", t("automation.rule.type.date.day")],
    ["WEEK", t("automation.rule.type.date.week")],
    ["MONTH", t("automation.rule.type.date.month")],
  ];
  const TYPE_CHOICES_DATE: Array<[IntervalEnum, string]> = [
    ["DAY", t("automation.rule.type.date.day")],
    ["WEEK", t("automation.rule.type.date.week")],
    ["MONTH", t("automation.rule.type.date.month")],
  ];

  const inputChoices = ["IsExactlyDaysBefore", "IsExactlyDaysAfter"].includes(
    dateField.getFormConditionOperator()
  )
    ? TYPE_CHOICES_DATE
    : TYPE_CHOICES_FULL;

  return (
    <>
      <GridColumn width={8} className={"value-column"}>
        <div className={styles.intervalInput}>
          <div className={styles.column}>
            <Input
              type={"text"}
              className={"small-number"}
              value={dateField.getInterval().number.toString()}
              onChange={(_, data) =>
                onChange({
                  number: data.value,
                  type: dateField.getInterval().type,
                })
              }
            />
          </div>
          <div className={styles.column}>
            <Dropdown
              value={dateField.getInterval().type}
              multiple={false}
              fluid={false}
              upward={false}
              placeholder={""}
              options={inputChoices.map(([value, text], key) => ({
                value,
                text,
                key,
              }))}
              onChange={(_, data) =>
                onChange({
                  number: dateField.getInterval().number,
                  type: data.value,
                })
              }
            />
          </div>
        </div>
      </GridColumn>
    </>
  );
}

function DatePeriodInput(props: {
  onChange: (value: any) => void;
  field: DateField;
  utcOffset: number;
}) {
  const { field, onChange, utcOffset } = props;

  const changeHandler = (data: PeriodType) => {
    return onChange(data);
  };
  const from = field.getPeriod()?.from;

  const to = field.getPeriod()?.to;
  const defaultDate = moment().utcOffset(utcOffset, true);

  const format = field.isTimeOnly() ? "HH:mm" : "dd.MM.yyyy";

  return (
    <>
      <GridColumn width={4} className={styles.periodInput}>
        <DatePickerUtcAware
          onChange={(date) => {
            changeHandler({
              from: date ?? defaultDate,
              to: to ? to : defaultDate,
            });
          }}
          utcOffset={utcOffset}
          selected={from ?? moment()}
          dateFormat={format}
          timeFormat={format}
          showTimeSelect={field.isTimeOnly()}
          showTimeSelectOnly={field.isTimeOnly()}
          timeIntervals={15}
          placeholderText={
            field.isTimeOnly() ? "00:00" : moment().format("dd.MM.yyyy")
          }
          wrapperClassName={"time picker"}
          adjustDateOnChange={true}
        />
      </GridColumn>
      <GridColumn width={4} className={styles.periodInput}>
        <DatePickerUtcAware
          onChange={(date) => {
            changeHandler({
              from: from ?? defaultDate,
              to: date ?? defaultDate,
            });
          }}
          utcOffset={utcOffset}
          selected={to ?? defaultDate}
          dateFormat={format}
          timeFormat={format}
          showTimeSelect={field.isTimeOnly()}
          showTimeSelectOnly={field.isTimeOnly()}
          timeIntervals={15}
          placeholderText={
            field.isTimeOnly() ? "00:00" : moment().format("dd.MM.yyyy")
          }
          wrapperClassName={"time picker"}
        />
      </GridColumn>
    </>
  );
}

function WeekDaysInput(props: {
  onChange: (value: any) => void;
  field: DateField;
}) {
  const { field, onChange } = props;
  const { t } = useTranslation();
  const TYPE_CHOICES_WEEKDAY: Array<[IntervalEnum, string]> = [
    ["MONDAY", t("automation.rule.type.day.monday")],
    ["TUESDAY", t("automation.rule.type.day.tuesday")],
    ["WEDNESDAY", t("automation.rule.type.day.wednesday")],
    ["THURSDAY", t("automation.rule.type.day.thursday")],
    ["FRIDAY", t("automation.rule.type.day.friday")],
    ["SATURDAY", t("automation.rule.type.day.saturday")],
    ["SUNDAY", t("automation.rule.type.day.sunday")],
  ];
  return (
    <>
      <GridColumn width={8} className={"value-column"}>
        <div className={"ui input"}>
          <Dropdown
            selection
            fluid
            multiple
            upward={false}
            value={field.getWeekDays()}
            onChange={(event, data) => {
              onChange((data.value as string[]).sort());
            }}
            options={TYPE_CHOICES_WEEKDAY.map(([wd, text], n) => ({
              value: String(n + 1),
              content: text,
              text: text,
              key: n,
            }))}
          />
        </div>
      </GridColumn>
    </>
  );
}
