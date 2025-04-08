import styles from "./BroadcastTitle.module.css";
import React from "react";

export default function BroadcastTitle(props: {
  header: string;
  subHeader: string;
}) {
  const { header, subHeader } = props;
  return (
    <div className="header">
      <div className={styles.header}>{header}</div>
      <div className={styles.subHeader}>{subHeader}</div>
    </div>
  );
}
