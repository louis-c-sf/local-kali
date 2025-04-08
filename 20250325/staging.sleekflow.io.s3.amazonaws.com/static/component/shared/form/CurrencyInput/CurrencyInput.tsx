import React from "react";
import styles from "./CurrencyInput.module.css";
import { Input, Dropdown, DropdownItemProps } from "semantic-ui-react";
import NumberFormat from "react-number-format";
import { toFloat } from "utility/string";

export function CurrencyInput(props: {
  currency: string;
  value: string;
  onCurrencyChange?: (currency: string) => void;
  onValueChange: (value: string) => void;
  disabled: boolean;
  error?: boolean;
  currencies: Array<{ value: string; text: string }>;
}) {
  const options = props.currencies.map<DropdownItemProps>(
    ({ value, text }, idx) => ({
      key: idx,
      value,
      text: text.toUpperCase(),
    })
  );

  return (
    <div>
      <Input
        actionPosition={"left"}
        className={`${styles.group} ${props.error ? styles.error : ""}`}
        action={
          props.onCurrencyChange ? (
            <Dropdown
              placeholder={"foo"}
              className={styles.currency}
              options={options}
              onChange={(_, { value }) => {
                props.onCurrencyChange!(value as string);
              }}
              selection
              value={props.currency}
              disabled={props.disabled}
            />
          ) : (
            <div className={styles.currencyLabel}>{props.currency}</div>
          )
        }
        input={
          <NumberFormat
            className={styles.input}
            placeholder="0.00"
            value={
              props.value === "" ? "" : (toFloat(props.value) ?? 0).toFixed(2)
            }
            onValueChange={(v) => props.onValueChange(String(v.value || ""))}
            displayType={"input"}
            thousandSeparator={","}
            decimalSeparator={"."}
            disabled={props.disabled}
          />
        }
      />
    </div>
  );
}
