import React from "react";
import styles from "./NoAccount.module.css";
import onboardingStyles from "./WhatsappCatalogOnboarding.module.css";
import WhatsappIcon from "../../../assets/images/channels/whatsapp.svg";
import { Button } from "component/shared/Button/Button";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import { useTranslation } from "react-i18next";

export default function NoAccount() {
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();

  return (
    <div
      className={`container ${onboardingStyles.content} ${styles.noAccount}`}
    >
      <div className={styles.header}>
        <img className={styles.icon} src={WhatsappIcon} alt="Whatsapp" />
      </div>
      <h1 className={styles.title}>
        {t("onboarding.whatsappCatalog.noAccount.title")}
      </h1>
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.noAccount.description")}
      </div>
      <Link to={routeTo("/guide/whatsapp-comparison/cloudAPI")}>
        <Button className={styles.button} primary fluid>
          {t("onboarding.whatsappCatalog.action.connect")}
        </Button>
      </Link>
    </div>
  );
}
