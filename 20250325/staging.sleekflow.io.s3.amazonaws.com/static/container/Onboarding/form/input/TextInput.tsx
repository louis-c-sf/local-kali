import React, { ReactNode } from "react";
import styles from "./TextInput.module.css";
import { FieldError } from "../../../../component/shared/form/FieldError";

export function TextInput(props: {
  onChange: (value: string) => void;
  label: string;
  hint: ReactNode;
  value: string;
  placeholder: string;
  error: string | undefined;
}) {
  const { hint, label, onChange, placeholder, value, error } = props;
  return (
    <div className="ui field">
      <label>{label}</label>
      <div className={styles.hint}>{hint}</div>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
      />
      <FieldError text={error} />
    </div>
  );
}
