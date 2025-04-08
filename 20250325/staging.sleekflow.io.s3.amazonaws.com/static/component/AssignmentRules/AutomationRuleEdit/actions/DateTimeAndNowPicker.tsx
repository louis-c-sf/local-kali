import React, { useState, useEffect } from "react";
import { Checkbox, Input, Portal } from "semantic-ui-react";
import styles from "./DateTimeAndNowPicker.module.css";
import { usePopperPopup } from "component/shared/popup/usePopperPopup";
import DatePicker from "react-datepicker";
import { Button } from "component/shared/Button/Button";
import moment, { Moment } from "moment";
import { useTranslation } from "react-i18next";

const NOW = "{datetime.now}";

export default function DateTimeAndNowPicker(props: {
  defaultValue: Moment | string;
  onChange: (value: Moment | string) => void;
}) {
  const { defaultValue, onChange } = props;
  const [open, setOpen] = useState(false);
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<Date | string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!defaultValue) {
      setValue(null);
      return;
    }
    setValue(
      defaultValue === NOW ? defaultValue : moment(defaultValue).toDate()
    );
  }, [defaultValue]);

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerNode,
      onClose: () => {
        setOpen(false);
      },
      placement: "top",
      offset: [10, 10],
      ignoreOutsideClickNodes: [],
      closeOnOutsideClick: true,
    },
    []
  );

  const checkedUseNowTime = () => {
    if (value === NOW) {
      setValue(null);
    } else {
      setValue(NOW);
    }
  };

  const selectDate = (date: Date | null) => {
    setValue(date || null);
  };

  const submitValue = () => {
    onChange(value === NOW ? NOW : moment(value));
    setOpen(false);
  };

  const displayValue = () => {
    if (!defaultValue) {
      return "";
    }
    if (defaultValue === NOW) {
      return "now";
    }
    return moment(defaultValue).format("yyyy/MM/DD h:mm a");
  };

  return (
    <>
      <div ref={setTriggerNode} className={styles.inputWrapper}>
        <Input
          value={displayValue()}
          fluid
          type="text"
          className={styles.input}
          onClick={() => setOpen(true)}
        />
      </div>
      <Portal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div ref={setPopupNode} className={styles.pickerWrapper}>
          <DatePicker
            selected={moment.isDate(value) ? value : null}
            inline
            showTimeSelect
            onChange={selectDate}
            dateFormat={"yyyy/MM/dd h:mm aa"}
          />
          <div className={styles.footer}>
            <Checkbox
              label={{ children: t("automation.action.update.modal.useNow") }}
              className={styles.checkbox}
              onChange={checkedUseNowTime}
              checked={value === NOW}
            />
            <Button
              primary
              fluid
              className={styles.submitButton}
              customSize="sm"
              onClick={submitValue}
            >
              {t("automation.action.update.modal.button.confirm")}
            </Button>
          </div>
        </div>
      </Portal>
    </>
  );
}
