import React from "react";
import styles from "features/Analytics/usecases/Performance/StaffPerformanceTable/ProgressCell.module.css";

export function ProgressCell(props: { value: number }) {
  const { value } = props;
  return (
    <div className={styles.progress}>
      <div
        className={styles.bar}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
      <div className={styles.value}>{value.toFixed(2)}%</div>
    </div>
  );
}
