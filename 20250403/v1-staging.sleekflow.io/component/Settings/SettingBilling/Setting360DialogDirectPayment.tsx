import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Setting360DialogDirectPayment.module.css";
import iconStyles from "../../../component/shared/Icon/Icon.module.css";
import { Button } from "../../shared/Button/Button";

const HUB_LINK = "https://hub.360dialog.com/auth/login";

const Setting360DialogDirectPayment = () => {
  const { t } = useTranslation();

  const handleDirectBtn = () => {
    window.open(HUB_LINK, "settingWhatsappQrCode");
  };

  return (
    <div className="main-primary-column content topup-credit">
      <div className="header">{t("settings.billing.directPayment.header")}</div>
      <div className={`subHeader ${styles.subHeader}`}>
        {t("settings.billing.directPayment.subHeader")}
      </div>
      <Button
        size="small"
        primary
        className={styles.paymentBtn}
        onClick={handleDirectBtn}
      >
        {t("settings.billing.directPayment.button")}
        <span className={`${iconStyles.icon} ${styles.scaledIcon}`} />
      </Button>
    </div>
  );
};

export default Setting360DialogDirectPayment;
