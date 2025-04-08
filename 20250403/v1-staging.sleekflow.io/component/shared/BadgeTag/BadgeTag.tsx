import React from "react";
import styles from "./BadgeTag.module.css";

export default function BadgeTag(props: {
  text: React.ReactNode;
  className?: string;
  noMargins?: boolean;
  compact?: boolean;
}) {
  let { className, noMargins = false, compact = false, text } = props;

  return (
    <div
      className={`
        ${styles.container}
        ${className ? className : ""} 
        ${noMargins ? styles.noMargins : ""}
        ${compact ? styles.compact : ""}
      `}
    >
      {text}
    </div>
  );
}
