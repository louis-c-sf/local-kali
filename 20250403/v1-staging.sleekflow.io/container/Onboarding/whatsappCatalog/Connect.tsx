import React from "react";
import styles from "./Connect.module.css";
import onboardingStyles from "./WhatsappCatalogOnboarding.module.css";
import WhatsappIcon from "../../../assets/images/channels/whatsapp.svg";
import Banner from "./assets/banner.jpeg";
import { Button } from "component/shared/Button/Button";
import { Link } from "react-router-dom";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import { useTranslation } from "react-i18next";
import useRouteConfig from "config/useRouteConfig";

export default function Connect() {
  const { goToNextStep, goToStep } = useWhatsappCatalogOnboarding();
  const accessRuleGuard = useAccessRulesGuard();
  const hasCloudAPI = accessRuleGuard.isCloudAPIAccount();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const submit = () => {
    if (hasCloudAPI) {
      goToNextStep();
    } else {
      goToStep(6);
    }
  };

  return (
    <div className={`container ${onboardingStyles.content} ${styles.connect}`}>
      <div className={styles.header}>
        <img className={styles.icon} src={WhatsappIcon} alt="Whatsapp" />
        <div>
          <h1 className={styles.title}>
            {t("onboarding.whatsappCatalog.connect.title")}
          </h1>
          <h2 className={styles.subTitle}>
            {t("onboarding.whatsappCatalog.connect.subTitle")}
          </h2>
        </div>
      </div>
      <div>
        <img src={Banner} alt="banner" />
      </div>
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.connect.description")}
      </div>

      {t("onboarding.whatsappCatalog.connect.needListTitle")}
      <div className={styles.listTitle} />
      <ul className={styles.list}>
        <li className={styles.listItem}>
          {t("onboarding.whatsappCatalog.connect.needWhatsappAccount")}
        </li>
        <li className={styles.listItem}>
          {t("onboarding.whatsappCatalog.connect.needFacebookBusinessAccount")}
        </li>
        <li className={styles.listItem}>
          {t(
            "onboarding.whatsappCatalog.connect.connectCatalogToBusinessAccount"
          )}
        </li>
      </ul>
      <Button className={styles.button} primary fluid onClick={submit}>
        {t("onboarding.whatsappCatalog.action.connectCatalog")}
      </Button>
      <div className={styles.linkWrapper}>
        <Link
          className={styles.link}
          to={routeTo("/onboarding/whatsappCatalog/setting")}
        >
          {t("onboarding.whatsappCatalog.action.manageCatalog")}
        </Link>
      </div>
    </div>
  );
}
