import React from "react";
import styles from "./ConsultusButton.module.css";
import { Button } from "../../shared/Button/Button";
import { useTranslation } from "react-i18next";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

const ConsultUsButton = ({
  consultUsMessage,
}: {
  consultUsMessage: string | undefined;
}) => {
  const { t } = useTranslation();
  return (
    <a
      href={getWhatsAppSupportUrl(consultUsMessage)}
      target={"_blank"}
      rel="noreferrer nofollow"
      className={styles.consultUsButton}
    >
      <Button primary>{t("settings.plan.addOn.button.consultUs")}</Button>
    </a>
  );
};

export default ConsultUsButton;
