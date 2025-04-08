import React, { ReactNode } from "react";
import styles from "./Field.module.css";
import { FieldError } from "component/shared/form/FieldError";

export function Field(props: {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error: string | undefined;
  checkbox?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`field 
      ${styles.field}
       ${props.checkbox ? styles.checkbox : ""}
       ${props.fullWidth ? styles.fullWidth : ""}
       `}
    >
      <label>{props.label}</label>
      {props.hint && props.checkbox && (
        <div className={styles.hint}>{props.hint}</div>
      )}
      {props.children}
      {props.hint && !props.checkbox && (
        <div className={styles.hint}>{props.hint}</div>
      )}
      {props.error && <FieldError text={props.error} />}
    </div>
  );
}
