import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./DemoModeBorder.module.css";
import BadgeTag from "../../../shared/BadgeTag/BadgeTag";

export default function DemoModeBorder(props: {
  children: React.ReactElement;
}) {
  const { children } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.border}>
      <div className={styles.tagWrapper}>
        <BadgeTag
          noMargins
          compact
          className={styles.tag}
          text={t("onboarding.inboxDemo.demoMode")}
        />
      </div>
      {children}
    </div>
  );
}
