import React, { ReactNode } from "react";
import styles from "./VerticalStepper.module.css";
import { pipe, when, append, join } from "ramda";

export type TierType = {
  header: { text: ReactNode; icon?: ReactNode };
  body: ReactNode;
  active: boolean;
  final?: boolean;
  error?: boolean;
};

export function VerticalStepper(props: {
  tiers: TierType[];
  checkType: "fill" | "check";
}) {
  const { checkType, tiers } = props;
  const isLast = (i: number) => i === tiers.length - 1;

  const getClasses = pipe(
    () => [],
    when(() => checkType === "fill", append(styles.fill)),
    when(() => checkType === "check", append(styles.check)),
    join(" ")
  );

  return (
    <div className={`${styles.stepper} ${getClasses()}`}>
      {tiers.map((t, i) => (
        <Tier {...t} isLast={isLast(i)} key={i} />
      ))}
    </div>
  );
}

export type TierPropsType = TierType & { isLast: boolean };

export function Tier(props: TierPropsType) {
  return (
    <div
      className={`${styles.tier}
        ${props.active ? styles.active : ""}
        ${props.error ? styles.error : ""}
        `}
    >
      <div className={styles.vertex} />
      {!props.isLast && <div className={styles.edge} />}
      <div className={styles.header}>
        <span className={styles.text}>{props.header.text}</span>
        {props.header.icon && (
          <span className={styles.icon}>{props.header.icon}</span>
        )}
      </div>
      <div className={styles.body}>{props.body}</div>
    </div>
  );
}
