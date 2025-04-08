import React, { useMemo, useState } from "react";
import styles from "./ScheduleInput.module.css";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { CloseButton } from "../../../shared/CloseButton";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";
import { Button } from "../../../shared/Button/Button";
import DatePickerUtcAware from "../../../shared/DatePickerUTCAware";
import { useCurrentUtcOffset } from "../../hooks/useCurrentUtcOffset";
import { Portal } from "semantic-ui-react";
import { usePopperPopup } from "../../../shared/popup/usePopperPopup";
import { setHours, setMinutes } from "date-fns";
import {
  toDatePickerDate,
  toUserUtcDate,
} from "../../../AssignmentRules/AutomationRuleEdit/fields/helpers";

function getRangeMoment(currentTime: Moment, inMinutes: number) {
  return currentTime.clone().add(inMinutes, "minutes").seconds(0);
}

export function ScheduleInput(props: {
  onSubmit: () => void;
  anchor: HTMLElement | null;
  closePopup: () => void;
}) {
  const { anchor, onSubmit } = props;
  const loginDispatch = useAppDispatch();
  const dateValue = useAppSelector(
    (s) => s.inbox.messenger.schedule.value,
    (prev, next) =>
      prev && next ? prev.isSame(next, "seconds") : prev === next
  );
  const dateValueTimestamp = dateValue ? dateValue.seconds(0) : undefined;
  const { t } = useTranslation();
  const utcOffset = useCurrentUtcOffset();
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);

  usePopperPopup(
    {
      anchorRef: anchor,
      onClose: props.closePopup,
      placement: "top-end",
      offset: [7, 0],
      popupRef: popupNode,
      closeOnOutsideClick: true,
    },
    []
  );

  const rangeOptions = [5, 10, 15, 30, 45, 60];

  function setDatepickerValue(date: Moment | null) {
    loginDispatch({
      type: "INBOX.SCHEDULE.VALUE_CHANGED",
      value: date,
    });
  }

  const minDateStamp = moment(toDatePickerDate(moment(), utcOffset))
    .add({ minutes: 1 })
    .set({ seconds: 0, milliseconds: 0 });

  function setRangeValue(inMinutes: number) {
    loginDispatch({
      type: "INBOX.SCHEDULE.VALUE_CHANGED",
      value: toUserUtcDate(
        getRangeMoment(minDateStamp, inMinutes).toDate(),
        utcOffset
      ),
    });
  }

  const minDate = useMemo(() => minDateStamp.toDate(), [minDateStamp.format()]);

  if (!anchor) {
    return null;
  }

  const selectedDateFormat = (
    dateValue?.clone().utcOffset(utcOffset) ?? minDateStamp
  )?.format("DD-MM-YYYY");
  return (
    <Portal open mountNode={document.body}>
      <div className={styles.container} ref={setPopupNode}>
        <div className={styles.close}>
          <CloseButton
            onClick={() =>
              loginDispatch({ type: "INBOX.SCHEDULE.SCHEDULE_CANCEL" })
            }
          />
        </div>
        <div className={styles.ranges}>
          <div className={styles.header}>
            {t("chat.schedule.ranges.header")}
          </div>
          <div className={styles.list}>
            {rangeOptions.map((n) => {
              const isSelected =
                dateValueTimestamp?.unix() ===
                getRangeMoment(minDateStamp, n).unix();
              return (
                <div
                  className={`${styles.range} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() => setRangeValue(n)}
                >
                  {t("chat.schedule.range.in", { count: n })}
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.inputWrap}>
          <div className={styles.header}>{t("chat.schedule.input.header")}</div>
          <div className={styles.input}>
            <DatePickerUtcAware
              onChange={setDatepickerValue}
              utcOffset={utcOffset}
              selected={dateValue ?? moment()}
              className={styles.datepicker}
              dateFormat={"yyyy/MM/dd h:mm aa"}
              showTimeSelect
              placeholderText={t("chat.schedule.input.placeholder")}
              minDate={minDate}
              minTime={
                minDateStamp.format("DD-MM-YYYY") === selectedDateFormat
                  ? setHours(
                      setMinutes(minDate, minDate.getMinutes()),
                      minDate.getHours()
                    )
                  : setHours(setMinutes(minDate, 0), 0)
              }
              maxTime={setHours(setMinutes(minDate, 59), 23)}
              timeFormat="h:mm aa"
              timeIntervals={30}
            />
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            primary
            disabled={dateValue === null}
            fluid
            className={styles.button}
            content={t("form.button.send")}
            onClick={onSubmit}
          />
        </div>
      </div>
    </Portal>
  );
}
