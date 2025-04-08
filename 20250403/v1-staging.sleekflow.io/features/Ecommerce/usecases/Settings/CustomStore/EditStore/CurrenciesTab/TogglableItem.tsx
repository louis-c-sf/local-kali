import React from "react";
import styles from "./TogglableItem.module.css";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { useTranslation } from "react-i18next";

export function TogglableItem(props: {
  title: string;
  subtitle: string;
  onToggle: () => void;
  value: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const disabled = props.disabled ?? false;
  return (
    <div className={styles.root}>
      <div className={styles.labels}>
        <div className={styles.title}>{props.title}</div>
        <div className={styles.subtitle}>{props.subtitle}</div>
      </div>
      <div className={styles.controls}>
        <ToggleInput
          on={props.value}
          size={"large"}
          disabled={disabled}
          onChange={props.onToggle}
          labelOn={t("settings.commerce.toggle.enable")}
          labelOff={t("settings.commerce.toggle.disable")}
        />
      </div>
    </div>
  );
}
