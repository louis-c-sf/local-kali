import React from "react";
import styles from "./CloseButton.module.css";
import { Icon } from "semantic-ui-react";

export function CloseButton(props: { top?: boolean; onClick: () => void }) {
  const { top = false, onClick } = props;
  return (
    <span
      className={`${styles.close} ${top ? styles.top : ""}`}
      onClick={onClick}
    >
      <Icon name={"close"} className={"lg"} />
    </span>
  );
}
