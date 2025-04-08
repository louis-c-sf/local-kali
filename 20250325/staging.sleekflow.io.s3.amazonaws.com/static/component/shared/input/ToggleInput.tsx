import { Checkbox } from "semantic-ui-react";
import styles from "./ToggleInput.module.css";
import React from "react";

export function ToggleInput(props: {
  on: boolean;
  labelOn?: string;
  labelOff?: string;
  onChange: (checked: boolean) => void;
  size?: "normal" | "large";
  disabled?: boolean;
}) {
  const size = props.size ?? "normal";
  const sizeMap = { normal: styles.normal, large: styles.large };

  return (
    <div
      className={`
        checkbox-group
        ${props.on ? "on" : "off"} 
        ${styles.group} 
        ${sizeMap[size] ?? ""}
       `}
    >
      <Checkbox
        toggle
        checked={props.on}
        disabled={props.disabled ?? false}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={(event, data) => {
          props.onChange(data.checked ?? false);
        }}
      />
      {((props.labelOff && !props.on) || (props.labelOn && props.on)) && (
        <label className={styles.append}>
          {props.on ? props.labelOn : props.labelOff}
        </label>
      )}
    </div>
  );
}
