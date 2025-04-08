import NumberFormat from "react-number-format";
import React from "react";

export function CurrencyInput(props: {
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <NumberFormat
      placeholder="0.00"
      value={
        props.value === "" ? "" : Math.abs(Number(props.value) || 0).toFixed(2)
      }
      onValueChange={(v) => props.onChange(v.floatValue?.toFixed(2) ?? "")}
      displayType={"input"}
      thousandSeparator={","}
      decimalSeparator={"."}
      decimalScale={2}
      prefix={"$ "}
      isAllowed={(values) =>
        (Number(values.value) || 0) < Number.MAX_SAFE_INTEGER
      }
      disabled={props.disabled}
    />
  );
}
