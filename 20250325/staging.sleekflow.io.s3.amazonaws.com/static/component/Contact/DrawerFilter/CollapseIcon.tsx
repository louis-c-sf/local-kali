import React from "react";
import styles from "./CollapseIcon.module.css";
import iconStyles from "../../shared/Icon/Icon.module.css";

export function CollapseIcon(props: { opened: boolean; toggle: () => void }) {
  const { opened, toggle } = props;

  return (
    <div
      className={`${iconStyles.icon}
               ${styles.expand} 
               ${opened ? styles.open : styles.close} `}
      onClick={toggle}
    />
  );
}
