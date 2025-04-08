import React from "react";
import styles from "./RadioInput.module.css";
import { Radio } from "semantic-ui-react";
import { StrictRadioProps } from "semantic-ui-react/dist/commonjs/addons/Radio/Radio";

export function RadioInput(props: StrictRadioProps) {
  const { className = "", ...restProps } = props;

  function getCLasses() {
    const classes = [className, styles.radio];
    if (restProps.checked) {
      classes.push(styles.checked);
    }
    return classes.join(" ");
  }

  return <Radio {...restProps} className={getCLasses()} />;
}
