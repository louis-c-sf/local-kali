import React, { ReactNode } from "react";
import styles from "./Fieldset.module.css";

export function Fieldset(props: { head: ReactNode; subhead: ReactNode }) {
  return (
    <div className={styles.fieldSet}>
      <div className={styles.head}>{props.head}</div>
      <div className={styles.subhead}>{props.subhead}</div>
    </div>
  );
}
