import React, { ReactNode } from "react";
import styles from "./TickedList.module.css";

export function TickedList(props: { items: ReactNode[]; inset?: boolean }) {
  const { inset = false, items } = props;
  return (
    <ul className={`${styles.list} ${inset ? styles.inset : ""}`}>
      {items.map((option, i) => (
        <li className={styles.item} key={i}>
          {option}
        </li>
      ))}
    </ul>
  );
}
