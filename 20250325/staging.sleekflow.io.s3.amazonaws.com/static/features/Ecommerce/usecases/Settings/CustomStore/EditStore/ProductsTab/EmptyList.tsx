import React from "react";
import styles from "./EmptyList.module.css";
import { useTranslation } from "react-i18next";

export function EmptyList(props: {}) {
  const { t } = useTranslation();
  return (
    <div className={styles.grid}>
      <div className={styles.icon}></div>
      <div className={styles.head}>
        {t("settings.commerce.products.empty.head")}
      </div>
      <div className={styles.subhead}>
        {t("settings.commerce.products.empty.subhead")}
      </div>
    </div>
  );
}
