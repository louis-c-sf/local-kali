import React from "react";
import styles from "./CheckboxInput.module.css";
import { Checkbox, StrictCheckboxProps } from "semantic-ui-react";

export function CheckboxInput(props: StrictCheckboxProps) {
  const { className = "", ...restProps } = props;

  function getCLasses() {
    const classes = [className, styles.checkbox];
    if (restProps.checked) {
      classes.push(styles.checked);
    }
    return classes.join(" ");
  }

  return <Checkbox {...restProps} className={getCLasses()} />;
}
