import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../../shared/Button/Button";
import styles from "./SendMessageOverlay.module.css";

export default function SendMessageOverlay(props: {
  setSelectedMode: (mode: string) => void;
}) {
  const { t } = useTranslation();
  const { setSelectedMode } = props;
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <Button
          customSize={"mid"}
          primary
          onClick={() => setSelectedMode("template")}
        >
          {t("automation.action.sendMessage.button.chooseTemplate")}
        </Button>
        <div className={styles.or}>{t("or")}</div>
        <div
          className={styles.trigger}
          onClick={() => {
            setSelectedMode("type");
          }}
        >
          {t("automation.action.sendMessage.link.typeMessage")}
        </div>
      </div>
    </div>
  );
}
