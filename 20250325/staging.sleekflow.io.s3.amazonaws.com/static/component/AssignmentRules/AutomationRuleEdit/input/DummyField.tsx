import React, { ReactNode, useContext } from "react";
import styles from "./DummyField.module.css";
import { ActionFormContext } from "../ActionsForm/ActionFormContext";

export function DummyField(props: {
  children: ReactNode;
  fluid?: boolean;
  compact?: boolean;
}) {
  let { children, compact, fluid } = props;
  const { readonly } = useContext(ActionFormContext);

  function getClasses() {
    const classes = [styles.dummy];
    fluid && classes.push(styles.fluid);
    compact && classes.push(styles.compact);
    readonly && classes.push(styles.readonly);
    return classes;
  }
  return <div className={getClasses().join(" ")}>{children}</div>;
}
