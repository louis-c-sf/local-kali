import React from "react";
import styles from "./CloseIcon.module.css";
import iconStyles from "../Icon/Icon.module.css";

export function CloseIcon(props: { onClick?: () => void }) {
  return (
    <div className={styles.close} onClick={props.onClick}>
      <i className={`${iconStyles.icon} ${styles.icon}`} />
    </div>
  );
}
