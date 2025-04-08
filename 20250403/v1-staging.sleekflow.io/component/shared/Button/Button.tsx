import React from "react";
import styles from "./Button.module.css";
import {
  Button as SemanticButton,
  ButtonProps as SemanticButtonProps,
} from "semantic-ui-react";

type ButtonProps = {
  customSize?: "sm" | "mid" | "input";
  noBorder?: boolean;
  inverseBackground?: true;
  blue?: boolean;
  centerText?: boolean;
} & SemanticButtonProps;

export function Button(props: ButtonProps) {
  const {
    className,
    children,
    customSize,
    centerText = false,
    inverseBackground = false,
    noBorder = false,
    blue = false,
    link = false,
    ...restProps
  } = props;
  const classNames = [className ?? "", styles.button];

  if (customSize) {
    const sizeMap = {
      sm: styles.sm,
      mid: styles.mid,
      input: styles.input,
    };
    classNames.push(sizeMap[customSize]);
  }

  if (inverseBackground) {
    classNames.push(styles.inverseBackground);
  }

  if (centerText) {
    classNames.push(styles.centerText);
  }

  if (props.primary) {
    classNames.push(styles.primary /*, styles.colored*/);
  }

  if (blue) {
    classNames.push(styles.blue);
  }
  if (props.noBorder) {
    classNames.push(styles.noBorder);
  }

  if (link) {
    classNames.push(styles.link);
  }

  return (
    <SemanticButton className={classNames.join(" ")} {...restProps}>
      {children}
    </SemanticButton>
  );
}
