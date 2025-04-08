import React, { ReactNode } from "react";
import styles from "features/Ecommerce/components/EditStoreContainer/Header.module.css";
import { useTranslation } from "react-i18next";

export function Header(props: {
  name: ReactNode;
  logoSrc: string;
  onDelete?: () => void;
  url?: string;
  hasTabs: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.header} ${props.hasTabs ? styles.tabbed : ""}`}>
      <div className={styles.logo}>
        <img src={props.logoSrc} />
      </div>
      <div className={styles.text}>{props.name}</div>
      <div className={styles.url}>{props.url}</div>
      <div className={styles.actions}>
        {props.onDelete && (
          <div className={styles.delete} onClick={props.onDelete}>
            <div className={styles.icon} />
            {t("settings.commerce.store.remove")}
          </div>
        )}
      </div>
    </div>
  );
}
