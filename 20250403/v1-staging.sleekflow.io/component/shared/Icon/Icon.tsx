import React from "react";
import styles from "./Icon.module.css";

const classMap = {
  eye: styles.eye,
  arrowRight: `${styles.arrow} ${styles.right}`,
  arrowLeft: `${styles.arrow} ${styles.left}`,
  deleteBin: styles.deleteBin,
  dots: styles.dotsIcon,
  "dots horizontal": `${styles.dotsIcon} ${styles.horizontal}`,
  dropdownIcon: styles.dropdownIcon,
  refresh: styles.refresh,
  cross: styles.cross,
  close: styles.cross,
  extLinkWhite: styles.extLinkWhite,
  extLinkBlue: styles.extLinkBlue,
  payment: styles.payment,
  info: styles.info,
  errorCircle: styles.errorCircle,
  tips: styles.tips,
  lock: styles.lock,
} as const;

export function Icon(props: {
  type: keyof typeof classMap;
  colored?: boolean;
}) {
  const { type, colored = false } = props;

  return (
    <span
      className={`
        ${styles.icon}
        ${colored ? styles.colored : styles.bg}
        ${classMap[type] ?? ""}
        _iconGlobalOverride
      `}
    />
  );
}
