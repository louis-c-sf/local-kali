import React, { ReactNode } from "react";
import styles from "./StatusLabel.module.css";

export type LabelColorType = "yellow" | "green" | "red" | "blue";

export function StatusLabel(props: {
  children: ReactNode;
  color: LabelColorType;
}) {
  function getClasses() {
    const colorMapping: Record<LabelColorType, string> = {
      blue: styles.blue,
      red: styles.red,
      green: styles.green,
      yellow: styles.yellow,
    };

    return [styles.label, colorMapping[props.color]].join(" ");
  }

  return <div className={getClasses()}>{props.children}</div>;
}
