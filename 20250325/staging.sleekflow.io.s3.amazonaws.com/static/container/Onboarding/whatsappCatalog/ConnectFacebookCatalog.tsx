import React from "react";
import styles from "./ConnectFacebookCatalog.module.css";
import onboardingStyles from "./WhatsappCatalogOnboarding.module.css";
import { Button } from "component/shared/Button/Button";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import StepHeader from "./components/StepHeader";
import ConnectFacebookBanner from "./assets/connect-facebook-catalog-banner.jpg";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { useTranslation, Trans } from "react-i18next";

export default function ConnectFacebookCatalog() {
  const { goToNextStep } = useWhatsappCatalogOnboarding();
  const { t } = useTranslation();

  return (
    <div
      className={`container ${onboardingStyles.content} ${styles.connectFacebookCatalog}`}
    >
      <StepHeader
        title={t("onboarding.whatsappCatalog.connectFacebookCatalog.title")}
      />
      <div>
        <img src={ConnectFacebookBanner} alt="banner" />
      </div>
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.connectFacebookCatalog.description")}
      </div>
      <ol>
        <li>
          <Trans
            i18nKey={"onboarding.whatsappCatalog.connectFacebookCatalog.step1"}
          >
            Go to WhatsApp account in your
            <a
              href="https://business.facebook.com/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Business settings
            </a>
            .
          </Trans>
        </li>
        <li>{t("onboarding.whatsappCatalog.connectFacebookCatalog.step2")}</li>
        <li>{t("onboarding.whatsappCatalog.connectFacebookCatalog.step3")}</li>
        <li>{t("onboarding.whatsappCatalog.connectFacebookCatalog.step4")}</li>
        <li>{t("onboarding.whatsappCatalog.connectFacebookCatalog.step5")}</li>
      </ol>
      <div className={styles.guide}>
        <Trans
          i18nKey={
            "onboarding.whatsappCatalog.connectFacebookCatalog.readGuide"
          }
        >
          Read the step-by-step guide
          <a
            href="https://docs.sleekflow.io/using-the-platform/commerce/whatsapp-catalog"
            target="_blank"
            rel="noreferrer noopener"
          >
            here
          </a>
        </Trans>
      </div>
      <div className={styles.tipWrapper}>
        <div className={styles.tipTitleWrapper}>
          <span className={`${iconStyles.icon} ${styles.tipIcon}`} />
          <div className={styles.tipTitle}>
            {t("onboarding.whatsappCatalog.connectFacebookCatalog.tip")}
          </div>
        </div>
        <div>
          {t(
            "onboarding.whatsappCatalog.connectFacebookCatalog.tipDescription"
          )}
        </div>
      </div>

      <Button className={styles.button} primary fluid onClick={goToNextStep}>
        {t("onboarding.whatsappCatalog.action.next")}
      </Button>
    </div>
  );
}
