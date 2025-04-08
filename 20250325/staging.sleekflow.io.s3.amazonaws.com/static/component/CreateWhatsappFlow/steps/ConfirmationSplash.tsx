import React from "react";
import flowStyles from "../CreateWhatsappFlow.module.css";
import styles from "./ConfirmationSplash.module.css";
import { useTranslation } from "react-i18next";
import { Button } from "../../shared/Button/Button";

export function ConfirmationSplash(props: {
  header: string;
  subheader: string;
  onDone: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={flowStyles.contentContainer}>
      <div className={styles.splash}>✅</div>
      <div className={styles.header}>{props.header}</div>
      <div className={styles.subheader}>{props.subheader}</div>
      <div className={styles.actions}>
        <Button
          content={t("form.button.backToChannels")}
          onClick={props.onDone}
          centerText
          customSize={"mid"}
          primary
        />
      </div>
    </div>
  );
}
