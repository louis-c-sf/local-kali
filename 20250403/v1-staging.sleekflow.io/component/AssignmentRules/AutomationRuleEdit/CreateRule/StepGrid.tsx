import React, { ReactNode } from "react";
import styles from "./StepGrid.module.css";

export namespace StepGrid {
  export function Grid(props: {
    columns: 1 | 2 | 3;
    tagged?: true;
    size: "normal" | "small";
    children: ReactNode[];
  }) {
    const { columns, tagged, size, children } = props;

    return (
      <div
        className={`
      ${styles.grid}
      ${
        columns === 1
          ? styles.single
          : columns === 2
          ? styles.double
          : styles.triple
      }
      ${size === "small" ? styles.small : ""}
      ${tagged ? styles.tagged : ""}
    `}
      >
        {children}
      </div>
    );
  }

  export function Item(props: { children: ReactNode; onClick: () => void }) {
    return (
      <div className={styles.item} onClick={props.onClick}>
        {props.children}
      </div>
    );
  }

  export function Pictogram(props: { children: ReactNode }) {
    return <div className={styles.pictogram}>{props.children}</div>;
  }

  export function Header(props: { children: ReactNode }) {
    return <div className={styles.header}>{props.children}</div>;
  }

  export function Body(props: { children: ReactNode }) {
    return <div className={styles.body}>{props.children}</div>;
  }

  export function Footer(props: { children: ReactNode }) {
    return <div className={styles.footer}>{props.children}</div>;
  }
}
