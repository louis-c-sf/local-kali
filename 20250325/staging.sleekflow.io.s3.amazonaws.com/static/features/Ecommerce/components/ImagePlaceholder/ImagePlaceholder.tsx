import React from "react";
import styles from "./ImagePlaceholder.module.css";

export function ImagePlaceholder(props: {
  size: "small" | "normal";
}): JSX.Element | null {
  const sizeMap = { small: styles.small, normal: "" } as const;
  const sizeClass = sizeMap[props.size];

  return <div className={`${styles.placeholder} ${sizeClass}`} />;
}
