import React from "react";
import styles from "./ProgressBar.module.css";

export default function ProgressBar(props: {
  total?: number;
  value: number;
  className?: string;
}) {
  const { total = 100, value, className = "" } = props;
  const percent = (value / total) * 100;
  return (
    <div className={`${styles.progressBar} ${className}`}>
      <span
        className={styles.bar}
        style={{ width: `${percent.toFixed(1)}%` }}
      ></span>
    </div>
  );
}
