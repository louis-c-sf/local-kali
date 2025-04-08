import React from "react";
import styles from "./MessageLimitLabel.module.css";
import { MessagingLimitMapping } from "component/CreateWhatsappFlow/types";
import { useTranslation } from "react-i18next";

export default function MessageLimitLabel(props: { messageLimit: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.label}>
      {`${t("channels.whatsapp.messageLimit")}: ${
        MessagingLimitMapping[props.messageLimit] ?? "N/A"
      }`}
    </div>
  );
}
