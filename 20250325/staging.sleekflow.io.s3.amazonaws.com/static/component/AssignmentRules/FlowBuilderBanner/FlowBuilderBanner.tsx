import React from "react";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import styles from "./FlowBuilderBanner.module.css";
function redirectToFlowBuilder() {
  window.open(
    `https://${process.env.REACT_APP_V2_PATH}/en/flow-builder`,
    "_blank"
  );
}
export function FlowBuilderBanner() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t("automation.flowbuilder.title")}</div>
      <div className={styles.content}>
        {t("automation.flowbuilder.content")}
      </div>
      <div className={styles.button}>
        <Button primary onClick={redirectToFlowBuilder}>
          {t("automation.flowbuilder.button.redirect")}
        </Button>
      </div>
    </div>
  );
}
