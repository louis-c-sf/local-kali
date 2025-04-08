import { Icon } from "semantic-ui-react";
import React from "react";

export function CloseButton(props: {
  onClick: () => void;
  size?: "lg" | "md";
  inverted?: true;
}) {
  let { onClick, size = "lg", inverted = false } = props;
  return (
    <span className={"close-button"} onClick={onClick}>
      <Icon name={"close"} className={`${inverted ? `${size}-white` : size}`} />
    </span>
  );
}
