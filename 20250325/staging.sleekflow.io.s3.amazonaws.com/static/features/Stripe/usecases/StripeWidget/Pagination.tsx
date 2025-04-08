import React from "react";
import styles from "./Pagination.module.css";
import { useTranslation } from "react-i18next";
import { Icon } from "../../../../component/shared/Icon/Icon";

export function Pagination(props: {
  pagesTotal: number;
  page: number;
  onChange: (page: number) => void;
}) {
  const { onChange, page, pagesTotal } = props;
  const { t } = useTranslation();

  const disablePrev = page === 1;
  const disableNext = page === pagesTotal;

  function goTo(page: number) {
    return () => onChange(page);
  }

  return (
    <div className={styles.root}>
      {pagesTotal > 2 && (
        <Button disabled={disablePrev} action={goTo(1)} double arrow={"left"} />
      )}
      <Button arrow={"left"} disabled={disablePrev} action={goTo(page - 1)} />
      <div className={styles.info}>
        {t("pagination.pageOf", { page: page, total: pagesTotal })}
      </div>
      <Button arrow={"right"} disabled={disableNext} action={goTo(page + 1)} />
      {pagesTotal > 2 && (
        <Button
          disabled={disableNext}
          action={goTo(pagesTotal)}
          double
          arrow={"right"}
        />
      )}
    </div>
  );
}

export function Button(props: {
  double?: boolean;
  arrow: "left" | "right";
  disabled: boolean;
  action: () => void;
}) {
  const { arrow, disabled, double = false, action } = props;

  function getClasses() {
    const classes = [styles.button];
    if (arrow === "right") {
      classes.push(styles.right);
    } else if (arrow === "left") {
      classes.push(styles.left);
    }
    if (double) {
      classes.push(styles.double);
    }
    if (disabled) {
      classes.push(styles.disabled);
    }
    return classes.join(" ");
  }

  return (
    <div className={getClasses()} onClick={!disabled ? action : undefined}>
      <Icon type={"dropdownIcon"} />
      {double && <Icon type={"dropdownIcon"} />}
    </div>
  );
}
