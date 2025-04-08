import React from "react";
import styles from "./CheckFacebookCatalog.module.css";
import onboardingStyles from "./WhatsappCatalogOnboarding.module.css";
import { Button } from "component/shared/Button/Button";
import Checkbox from "./assets/checkbox.png";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import StepHeader from "./components/StepHeader";
import { useTranslation, Trans } from "react-i18next";

export default function CheckFacebookCatalog() {
  const { goToNextStep } = useWhatsappCatalogOnboarding();
  const { t } = useTranslation();

  return (
    <div
      className={`container ${onboardingStyles.content} ${styles.checkFacebookCatalog}`}
    >
      <StepHeader
        title={t("onboarding.whatsappCatalog.checkFacebookCatalog.title")}
      />
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.checkFacebookCatalog.description")}
      </div>
      <div className={`container ${styles.checkWrapper}`}>
        <img className={styles.checkbox} src={Checkbox} alt="Checkbox" />
        <span>
          {t(
            "onboarding.whatsappCatalog.checkFacebookCatalog.haveFacebookCatalog"
          )}
        </span>
      </div>
      <div className={styles.ask}>
        {t("onboarding.whatsappCatalog.checkFacebookCatalog.ask")}
      </div>
      <div className={styles.answer}>
        <Trans
          i18nKey={"onboarding.whatsappCatalog.checkFacebookCatalog.answer"}
        >
          Read the guide
          <a
            href="https://docs.sleekflow.io/using-the-platform/commerce/whatsapp-catalog"
            target="_blank"
            rel="noreferrer noopener"
          >
            here
          </a>
          to create one
        </Trans>
      </div>
      <Button className={styles.button} primary fluid onClick={goToNextStep}>
        {t("onboarding.whatsappCatalog.action.next")}
      </Button>
    </div>
  );
}
