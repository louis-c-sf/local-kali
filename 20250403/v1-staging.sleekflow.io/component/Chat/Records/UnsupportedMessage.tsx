import React from "react";
import styles from "./UnsupportedMessage.module.css";
import { Image } from "semantic-ui-react";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import InfoIcon from "../../../assets/images/info-circle.svg";
import { useTranslation, Trans } from "react-i18next";

export const UnsupportedMessage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.unsupportedMessage}>
      <div className={styles.header}>
        <div className={styles.title}>
          {t("chat.message.unsupportedMsgType.title")}
        </div>
        <InfoTooltip
          placement={"top"}
          children={<>{t("chat.message.unsupportedMsgType.tooltip")}</>}
          trigger={<Image src={InfoIcon} className={styles.icon} />}
        />
      </div>
      <div className={styles.description}>
        {t("chat.message.unsupportedMsgType.description")}
      </div>
    </div>
  );
};
