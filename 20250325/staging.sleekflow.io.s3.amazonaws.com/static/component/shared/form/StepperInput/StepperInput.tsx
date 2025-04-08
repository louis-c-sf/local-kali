import React, { ChangeEvent } from "react";
import styles from "./StepperInput.module.css";
import PlusIcon from "../../../../assets/tsx/icons/PlusIcon";
import MinusIcon from "../../../../assets/tsx/icons/MinusIcon";
import { clamp } from "ramda";
import NumberFormat from "react-number-format";

export function StepperInput(props: {
  amount: number;
  step?: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  format?: string;
  disabled: boolean;
  inputDisable?: boolean;
}) {
  const {
    amount,
    onChange,
    min,
    max,
    disabled,
    step = 1,
    format,
    inputDisable,
  } = props;

  function stepUp() {
    onChange(clamp(min, max, amount + step));
  }

  function stepDown() {
    onChange(clamp(min, max, amount - step));
  }

  const minusDisabled = disabled || amount <= min;
  const plusDisabled = disabled || amount >= max;

  const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || props.min;
    onChange(clamp(min, max, value));
  };

  return (
    <div className={styles.root}>
      <div
        className={`${styles.minus} ${minusDisabled ? styles.disabled : ""}`}
        onClick={!minusDisabled ? stepDown : undefined}
      >
        <MinusIcon style={"thick"} />
      </div>
      <div className={`${styles.input} ui input`}>
        <NumberFormat
          value={amount}
          type={"text"}
          min={min}
          max={max}
          format={format}
          size={String(max).length}
          defaultValue={min}
          displayType={"input"}
          disabled={inputDisable || disabled}
          readOnly={disabled || (minusDisabled && plusDisabled)}
          onChange={handleNativeChange}
        />
      </div>
      <div
        className={`${styles.plus} ${plusDisabled ? styles.disabled : ""}`}
        onClick={!plusDisabled ? stepUp : undefined}
      >
        <PlusIcon />
      </div>
    </div>
  );
}
