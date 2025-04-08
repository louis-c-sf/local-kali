import React from "react";
import styles from "./RemoveButton.module.css";
import CrossLgIcon from "../../../../../assets/tsx/icons/CrossLgIcon";

export function RemoveButton(props: { close: () => void }) {
  return (
    <span className={styles.button} onClick={props.close}>
      <CrossLgIcon />
    </span>
  );
}
