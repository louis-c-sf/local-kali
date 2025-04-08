import React from "react";
import { Link } from "react-router-dom";
import { Button, Dropdown, Grid, GridColumn, GridRow } from "semantic-ui-react";
import {
  AssignmentRuleType,
  AssignmentScheduleType,
  ScheduleIntervalType,
} from "../../../types/AssignmentRuleType";
import GenericDropdown from "../../Form/GenericDropdown";
import moment, { Moment } from "moment";
import { DropdownOptionType } from "../../Chat/ChannelFilterDropdown";
import { array, mixed, number, object, string, TestContext } from "yup";
import { FormikErrors } from "formik";
import DatePickerUtcAware from "../../shared/DatePickerUTCAware";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { useAutomationRulesLocalized } from "./localizable/useAutomationRulesLocalized";
import { DummyField } from "./input/DummyField";
import styles from "./Action/ActionsForm.module.css";
import { CloseButton } from "./CloseButton/CloseButton";
import { useAppSelector } from "AppRootContext";
import { pick } from "ramda";

type ScheduleFormProps = {
  interval: AssignmentScheduleType | undefined;
  setInterval: (value: AssignmentScheduleType) => void;
  removeInterval: () => void;
  errors: FormikErrors<AssignmentRuleType>;
};

function numbers(n: number) {
  return new Array(n).fill(0).map((_, i) => i + 1);
}

function ScheduleForm(props: ScheduleFormProps) {
  const { setInterval, interval } = props;
  const { t } = useTranslation();
  const { scheduleIntervalDict } = useAutomationRulesLocalized();
  const utcOffset = useCurrentUtcOffset();
  const selectedTimeZone = useAppSelector((s) => s.selectedTimeZone);
  const operator = selectedTimeZone > 0 ? "+" : "-";
  function getValueChoices(type: ScheduleIntervalType): DropdownOptionType[] {
    let choices: DropdownOptionType[] = [];
    switch (type) {
      case "WEEK":
        choices = moment.weekdays().map((text, n) => ({
          value: String(n),
          content: text,
          text,
          key: n,
        }));
        break;

      case "MONTH":
        choices = numbers(31).map((day) => ({
          value: String(day),
          content: day.toString(),
          text: day.toString(),
          key: day,
        }));
        break;

      case "YEAR":
        choices = moment.months().map((mon, n) => ({
          value: String(n + 1),
          content: mon,
          text: mon,
          key: n,
        }));
        break;
    }

    return choices;
  }

  function isTypeRequireChoices(type: ScheduleIntervalType) {
    return ["YEAR", "MONTH", "WEEK"].includes(type);
  }

  function withTime(
    interval: AssignmentScheduleType,
    time: Moment
  ): AssignmentScheduleType {
    return {
      ...interval,
      time: time,
    };
  }

  function withAmount(
    interval: AssignmentScheduleType,
    amount: string[]
  ): AssignmentScheduleType {
    return {
      ...interval,
      amount: amount.map(Number).filter((n) => !isNaN(n)),
    };
  }

  function withType(
    interval: AssignmentScheduleType,
    type: ScheduleIntervalType
  ): AssignmentScheduleType {
    return {
      ...interval,
      type,
      amount: [],
    };
  }

  return (
    <div className={styles.section}>
      <div className={styles.title}>
        {t("automation.rule.form.schedule.header")}
      </div>
      <div className="field-note">
        {t("automation.rule.form.schedule.subheader")}
      </div>
      {interval !== undefined && (
        <Grid className={"schedule-form"}>
          <GridRow className={"condition-field"}>
            <GridColumn width={4}>
              <DummyField>
                {t("automation.rule.form.schedule.field.interval.label")}
              </DummyField>
            </GridColumn>
            <GridColumn width={4}>
              <GenericDropdown<ScheduleIntervalType, ScheduleIntervalType>
                multiple={false}
                value={interval.type}
                serializeItem={(v) => v.toString()}
                unserializeItem={(v) => v as ScheduleIntervalType}
                renderChoice={(v) => scheduleIntervalDict[v] ?? "-"}
                onChange={(event, data) => {
                  const value = [data].flat(2)[0] as ScheduleIntervalType;
                  props.setInterval(withType(interval, value));
                }}
                options={["DAY", "WEEK", "MONTH", "YEAR"]}
              />
            </GridColumn>
            {isTypeRequireChoices(interval.type) && (
              <GridColumn width={8} className={"value-column"}>
                <Dropdown
                  multiple
                  search
                  fluid
                  selection
                  noResultsMessage={t("form.field.dropdown.noResults")}
                  value={interval.amount.map(String)}
                  onChange={(_, data) => {
                    props.setInterval(
                      withAmount(interval, data.value as string[])
                    );
                  }}
                  options={getValueChoices(interval.type)}
                />
              </GridColumn>
            )}
            <CloseButton onClick={props.removeInterval} top />
          </GridRow>
          <GridRow className={"condition-field"}>
            <GridColumn width={4}>
              <div className={"control-item"}>
                <DummyField>
                  {t("automation.rule.form.schedule.field.at.label")}
                </DummyField>
              </div>
            </GridColumn>
            <GridColumn width={4}>
              <div className={"control-item"}>
                <DatePickerUtcAware
                  selected={interval.time}
                  onChange={(date) => {
                    const time = date ?? moment.utc("00:00", "HH:mm");
                    props.setInterval(withTime(interval, time));
                  }}
                  utcOffset={utcOffset}
                  dateFormat={"HH:mm"}
                  timeFormat={"HH:mm"}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  placeholderText={"00:00"}
                  wrapperClassName={"time picker"}
                />
              </div>
            </GridColumn>
            <div className="timezone">
              <Trans
                i18nKey={"automation.rule.form.schedule.field.timezone.label"}
                values={{
                  timezone: `${operator}${selectedTimeZone}`,
                }}
              >
                Current time zone: <br />
                {selectedTimeZone}
                <Link to="/settings/generalinfo">Change in Settings</Link>
              </Trans>
            </div>
          </GridRow>
        </Grid>
      )}
      {interval === undefined && (
        <div className="add-row">
          <Button
            onClick={() =>
              setInterval({
                amount: [],
                type: "DAY",
                time: moment({ hour: 0, minute: 0 }),
              })
            }
            className={"button-small"}
            content={t("automation.rule.form.schedule.button.add")}
          />
        </div>
      )}
    </div>
  );
}

export default ScheduleForm;

export function scheduleSchema(t: TFunction) {
  const defaultError = t("automation.rule.form.schedule.error.default");

  return object({
    type: string()
      .ensure()
      .required(
        t("automation.rule.form.schedule.field.interval.error.required")
      )
      .oneOf(
        ["DAY", "MONTH", "YEAR", "WEEK"],
        t("automation.rule.form.schedule.field.interval.error.required")
      ),

    time: mixed().when("type", {
      is: "DAY",
      then: mixed().test(
        "HH:mm time",
        t("automation.rule.form.schedule.field.at.error.format"),
        function (this: TestContext, value?: Moment | undefined) {
          if (!moment.isMoment(value) || !value.isValid()) {
            throw this.createError({
              message: t(
                "automation.rule.form.schedule.field.at.error.invalid"
              ),
              path: this.path,
            });
          }
          return true;
        }
      ),
    }),

    amount: array()
      .when("type", {
        is: "WEEK",
        then: array(
          number()
            .integer(defaultError)
            .min(1, defaultError)
            .max(7, defaultError)
        )
          .required(defaultError)
          .min(1, defaultError)
          .max(7, defaultError),
      })
      .when("type", {
        is: "MONTH",
        then: array(
          number()
            .integer(defaultError)
            .min(1, defaultError)
            .max(31, defaultError)
        )
          .required(defaultError)
          .min(1, defaultError)
          .max(31, defaultError),
      })
      .when("type", {
        is: "YEAR",
        then: array(
          number()
            .integer(defaultError)
            .min(1, defaultError)
            .max(12, defaultError)
        )
          .required(defaultError)
          .min(1, defaultError)
          .max(12, defaultError),
      }),
  });
}

export function recurringJobSchema(t: TFunction) {
  return object({
    schedule: object().when("automationType", {
      is: "RecurringJob",
      then: object().required(
        t("automation.rule.form.schedule.error.required")
      ),
    }),
  });
}
