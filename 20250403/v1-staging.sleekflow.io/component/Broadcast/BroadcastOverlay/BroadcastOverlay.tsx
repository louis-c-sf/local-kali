import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/Button/Button";
import styles from "./BroadcastOverlay.module.css";

export default function BroadcastOverlay(props: {
  isOptInEnabled: boolean;
  clickTemplate: () => void;
  ableToTypeMessage: () => void;
  disabled: boolean;
}) {
  let { ableToTypeMessage, clickTemplate, disabled, isOptInEnabled } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Button
          customSize={"mid"}
          primary
          onClick={disabled ? undefined : clickTemplate}
          disabled={disabled}
        >
          {t("chat.selectWhatsappTemplate.overlay.actions.add")}
        </Button>
        {isOptInEnabled && (
          <>
            <div className={styles.or}>{t("or")}</div>
            <div className={styles.trigger} onClick={ableToTypeMessage}>
              {t("chat.selectWhatsappTemplate.overlay.actions.type")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
