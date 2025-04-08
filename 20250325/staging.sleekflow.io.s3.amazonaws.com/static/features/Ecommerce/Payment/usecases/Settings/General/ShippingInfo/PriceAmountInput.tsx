import React from "react";
import NumberFormat from "react-number-format";
import styles from "./PriceAmountInput.module.css";

export default function PriceAmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={styles.inputContainer}>
      <NumberFormat
        value={value}
        onValueChange={(v) => onChange(v.floatValue ?? 0)}
        displayType={"input"}
        thousandSeparator={","}
        decimalSeparator={"."}
        decimalScale={2}
        fixedDecimalScale
      />
      <div className={styles.dollarSign}>
        <span>$</span>
      </div>
    </div>
  );
}
