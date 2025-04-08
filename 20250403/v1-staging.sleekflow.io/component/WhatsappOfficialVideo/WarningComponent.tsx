import StatusAlert, { StatusType } from "component/shared/StatusAlert";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./WhatsappOfficialVideo.module.css";

export const RegularWarning = (props: { type: StatusType }) => {
  const { t } = useTranslation();
  return (
    <StatusAlert type={props.type} className={styles.warning}>
      <>
        <span>{t("guideContainer.official.regularWarning.description")}</span>
        <ul>
          <li>{t("guideContainer.official.regularWarning.sendMessage")}</li>
          <li>{t("guideContainer.official.regularWarning.accessWhatsapp")}</li>
        </ul>
      </>
    </StatusAlert>
  );
};

export const ConnectFailWarning = () => {
  const { t } = useTranslation();

  return (
    <StatusAlert type="warning" className={styles.warning}>
      <span>{t("guideContainer.official.connectFailWarning")}</span>
    </StatusAlert>
  );
};
