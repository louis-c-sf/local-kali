import { useTranslation } from "react-i18next";
import moment from "moment";
import styles from "./Body.module.css";
import React, { ReactNode } from "react";

export function Field(props: {
  label: string;
  value: any;
  enlarge?: boolean;
  type: "string" | "boolean" | "date";
  children?: ReactNode;
}) {
  const { enlarge = false, label, value, type } = props;
  const { t } = useTranslation();

  function displayValue(value: any) {
    switch (type) {
      case "string":
        return String(value) || "-";
      case "boolean":
        return value ? t("form.button.yes") : t("form.button.no");
      case "date":
        const date = moment(value);
        return date.isValid() ? date.format("DD.MM.YYYY") : "-";
      default:
        return String(value) || "-";
    }
  }

  return (
    <div className={styles.item}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${enlarge ? styles.xl : ""}`}>
        {props.children ?? displayValue(value)}
      </div>
    </div>
  );
}
