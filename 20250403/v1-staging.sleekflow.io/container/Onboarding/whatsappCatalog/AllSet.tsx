import React from "react";
import styles from "./AllSet.module.css";
import onboardingStyles from "./WhatsappCatalogOnboarding.module.css";
import { Button } from "component/shared/Button/Button";
import { Link } from "react-router-dom";
import useRouteConfig from "config/useRouteConfig";
import InboxIcon from "./assets/inbox.svg";
import SettingsIcon from "./assets/settings.svg";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import { useTranslation } from "react-i18next";

export default function AllSet() {
  const { catalogInfo } = useWhatsappCatalogOnboarding();
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();

  return (
    <div className={`container ${onboardingStyles.content} ${styles.allSet}`}>
      <div className={styles.header}>
        <span className={styles.icon} role="img" aria-label="success icon">
          🎉
        </span>
        <h1 className={styles.title}>
          {t("onboarding.whatsappCatalog.allSet.title")}
        </h1>
        <div className={styles.subTitle}>
          {t("onboarding.whatsappCatalog.allSet.subTitle")}
        </div>
      </div>
      <div className={styles.catalogInfo}>
        <div className={styles.catalogInfoItem}>
          <div className={styles.infoLabel}>
            {t("onboarding.whatsappCatalog.allSet.wabaName")}
          </div>
          <div>{catalogInfo.wabaName}</div>
        </div>
        <div className={styles.catalogInfoItem}>
          <div className={styles.infoLabel}>
            {t("onboarding.whatsappCatalog.allSet.catalogName")}
          </div>
          <div>{catalogInfo.catalogName}</div>
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIconWrapper}>
          <div className={styles.featureIcon}>
            <img src={InboxIcon} alt="inbox" />
          </div>
        </div>
        <div className={styles.featureContent}>
          <div className={styles.featureTitle}>
            {t("onboarding.whatsappCatalog.allSet.paymentLinkTitle")}
          </div>
          <div className={styles.featureDescription}>
            {t("onboarding.whatsappCatalog.allSet.paymentLinkDescription")}
          </div>
        </div>
      </div>
      <div className={styles.feature}>
        <div className={styles.featureIconWrapper}>
          <div className={styles.featureIcon}>
            <img src={SettingsIcon} alt="settings" />
          </div>
        </div>
        <div className={styles.featureContent}>
          <div className={styles.featureTitle}>
            {t("onboarding.whatsappCatalog.allSet.manageCatalogTitle")}
          </div>
          <div>
            {t("onboarding.whatsappCatalog.allSet.manageCatalogDescription")}
          </div>
        </div>
      </div>
      <Link to={routeTo("/channels")}>
        <Button className={styles.button} primary fluid>
          {t("onboarding.whatsappCatalog.action.goToChannel")}
        </Button>
      </Link>
      <div className={styles.linkWrapper}>
        <a
          className={styles.link}
          href="https://docs.sleekflow.io/using-the-platform/commerce/whatsapp-catalog"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("onboarding.whatsappCatalog.action.learnMore")}
        </a>
      </div>
    </div>
  );
}
