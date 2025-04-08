import React, { useMemo, useState } from "react";
import { Dropdown, DropdownItem } from "semantic-ui-react";
import { DateRangePicker } from "react-dates";
import { useTranslation } from "react-i18next";
import styles from "component/shared/input/DateRangeFilter.module.css";
import { useMinimumAnalyticsDate } from "component/shared/input/DateRangeFilter/useMinimumAnalyticsDate";
import { TFunction } from "i18next";
import moment, { Moment } from "moment/moment";

type DurationUnit = moment.unitOfTime.DurationConstructor;

export interface DatePeriodType {
  count: number | undefined;
  unit: DurationUnit | undefined;
}

interface TimeRangeProps {
  key: string;
  value: string;
  text: string;
  count?: number;
  unit?: DurationUnit;
}

export function getPeriodString(from: Moment, to: Moment, t: TFunction) {
  const mapping: Array<[DurationUnit, (count: number) => string]> = [
    ["year", (count) => t("analytics.time-unit.yearWithCount", { count })],
    ["month", (count) => t("analytics.time-unit.monthWithCount", { count })],
    ["week", (count) => t("analytics.time-unit.weekWithCount", { count })],
    ["day", (count) => t("analytics.time-unit.dayWithCount", { count })],
  ];

  return mapping.reduce<string | null>((acc, next) => {
    if (acc !== null) {
      return acc;
    }
    const [unit, text] = next;
    const diff = Math.abs(from.diff(to, unit, true));
    if (Math.floor(diff) === diff) {
      return text(diff);
    }
    return null;
  }, null);
}

export function DateRangeFilter(props: {
  startDate: Moment;
  endDate: Moment;
  maxDate: Moment;
  setDates: (start: Moment, end: Moment) => void;
  showComparedPeriod: boolean;
  showCustomDropdown?: boolean;
}) {
  const {
    endDate,
    maxDate,
    setDates,
    startDate,
    showComparedPeriod,
    showCustomDropdown = true,
  } = props;
  const { t } = useTranslation();

  const [focusedDatepicker, setFocusedDatepicker] = useState<
    "startDate" | "endDate" | null
  >(null);

  const [startTmp, setStartTmp] = useState<Moment | null>(null);
  const [endTmp, setEndTmp] = useState<Moment | null>(null);

  function changeTimeRange(range: TimeRangeProps) {
    const newStartDate = maxDate.clone().subtract(range.count, range.unit);
    setDates(newStartDate, maxDate.clone());
  }

  const lastMonth = useMemo(() => moment().subtract(1, "month"), []);
  const minimumAnalyticsDate = useMinimumAnalyticsDate();

  const TimeRangeOptions: TimeRangeProps[] = [
    {
      key: "last7days",
      value: "last7days",
      text: t("analytics.time-range.last7days"),
      count: 7,
      unit: "day",
    },
    {
      key: "last14days",
      value: "last14days",
      text: t("analytics.time-range.last14days"),
      count: 14,
      unit: "day",
    },
    {
      key: "last1month",
      value: "last1month",
      text: t("analytics.time-range.last1month"),
      count: 1,
      unit: "month",
    },
  ];

  function getMatchingRangeOption() {
    const customItem = {
      key: "custom",
      value: "custom",
      text: t("analytics.time-range.custom"),
    };
    return (
      TimeRangeOptions.find((option) => {
        const expectStartDate = endDate
          .clone()
          .subtract(option.count, option.unit);
        const diff = Math.abs(expectStartDate.diff(startDate.clone(), "days"));
        return diff === 0;
      }) ?? customItem
    );
  }

  const minDate = minimumAnalyticsDate ?? lastMonth;
  const isEndsAtMaxDate = endDate.diff(maxDate, "days") === 0;
  const prevPeriodText = isEndsAtMaxDate
    ? getPeriodString(startDate.clone(), endDate.clone(), t) ??
      t("analytics.time-range.custom")
    : t("analytics.time-range.custom");

  return (
    <div className={styles.root}>
      {showCustomDropdown && (
        <form className={`ui form ${styles.form}`}>
          <Dropdown
            text={getMatchingRangeOption().text}
            defaultValue={getMatchingRangeOption().text}
            upward={false}
          >
            <Dropdown.Menu>
              {TimeRangeOptions.map((item) => (
                <DropdownItem
                  key={item.key}
                  value={item.value}
                  onClick={() => changeTimeRange(item)}
                >
                  <span>{item.text}</span>
                </DropdownItem>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </form>
      )}
      <DateRangePicker
        startDate={(startTmp ?? startDate).clone()}
        startDateId="1"
        endDate={(endTmp ?? endDate).clone()}
        endDateId="2"
        hideKeyboardShortcutsPanel={true}
        focusedInput={focusedDatepicker}
        onFocusChange={(focused) => setFocusedDatepicker(focused)}
        onClose={() => {
          setStartTmp(null);
          setEndTmp(null);
        }}
        onDatesChange={({ startDate, endDate }) => {
          if (startDate && endDate) {
            return setDates(startDate, endDate);
          }
          if (startDate) {
            const end = endDate ?? endTmp;
            if (end) {
              setDates(startDate, end);
            } else {
              setStartTmp(startDate);
            }
          } else if (endDate) {
            const start = startDate ?? startTmp;
            if (start) {
              setDates(start, endDate);
            } else {
              setEndTmp(endDate);
            }
          }
        }}
        isOutsideRange={(date) =>
          date.isAfter(maxDate, "day") || date.isBefore(minDate, "day")
        }
      />
      {showComparedPeriod && (
        <div className={styles.periods}>
          {t("analytics.compare-prev-period", { prevPeriod: prevPeriodText })}
        </div>
      )}
    </div>
  );
}
