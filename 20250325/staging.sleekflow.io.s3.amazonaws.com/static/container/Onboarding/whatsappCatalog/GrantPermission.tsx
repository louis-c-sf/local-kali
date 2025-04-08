import React, { useCallback } from "react";
import styles from "./WhatsappCatalogOnboarding.module.css";
import { Button } from "component/shared/Button/Button";
import StepHeader from "./components/StepHeader";
import { useWhatsappCatalogOnboarding } from "./WhatsappCatalogOnboarding";
import { useFacebookLogin } from "features/Facebook/helper/useFacebookLogin";
import { useTranslation } from "react-i18next";

export default function GrantPermission() {
  const { goToNextStep, setAccessToken } = useWhatsappCatalogOnboarding();
  const { t } = useTranslation();
  const facebookLogin = useFacebookLogin({
    updateEvent: useCallback(
      (token) => {
        if (!token) return;
        setAccessToken(token);
        goToNextStep();
      },
      [goToNextStep]
    ),
  });

  const submit = () => {
    facebookLogin.handleClick({ type: "whatsappCatalogConnect" });
  };
  return (
    <div className={`container ${styles.content} ${styles.grantPermission}`}>
      <StepHeader
        title={t("onboarding.whatsappCatalog.grantPermission.title")}
      />
      <div className={styles.description}>
        {t("onboarding.whatsappCatalog.grantPermission.description")}
      </div>
      <ul className={styles.list}>
        <li>{t("onboarding.whatsappCatalog.grantPermission.accessCatalog")}</li>
        <li>
          {t("onboarding.whatsappCatalog.grantPermission.accessWhatsapp")}
        </li>
      </ul>
      <Button
        className={styles.button}
        primary
        fluid
        onClick={submit}
        loading={facebookLogin.loader.isLoading}
      >
        {t("onboarding.whatsappCatalog.action.continue")}
      </Button>
    </div>
  );
}
