import React, { useEffect, useState } from "react";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import styles from "./Create360DialogAccount.module.css";
import iconStyles from "../../component/shared/Icon/Icon.module.css";
import { Trans, useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { TickedList } from "../shared/content/TickedList";
import { Button } from "../shared/Button/Button";
import { Create360DialogForm } from "./steps/Create360DialogForm";
import { CreateAccountTutorial } from "./CreateAccountTutorial";
import { Create360DialogChannelResponseType } from "../../api/Channel/submitCreate360DialogChannel";
import { Checkbox } from "semantic-ui-react";
import i18n from "i18n";
import { useLocation } from "react-router";

export const LOCALSTORAGE_PUBLIC_API_KEY = "CREATE_360_DIALOG_KEY";

export function Create360DialogAccount(props: {
  onSuccess: (channelCreated: Create360DialogChannelResponseType) => void;
  migrateTo360DialogUrl: string;
}) {
  const { t } = useTranslation();
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);
  const [isEnabledTwoFactor, setIsEnabledTwoFactor] = useState<boolean>();
  const [clientAPIKey, setClientAPIKey] = useState<string | null>(null);
  const location = useLocation();
  const param = new URLSearchParams(location.search);
  const partnerId = param.get("isPartnerPayment")
    ? process.env.REACT_APP_360DIALOG_PARTNER_PAYMENT_PARTNER_ID
    : process.env.REACT_APP_360DIALOG_DIRECT_PAYMENT_PARTNER_ID;

  function showTutorial() {
    setIsTutorialVisible(true);
  }

  function hideTutorial() {
    setIsTutorialVisible(false);
  }

  function popupWindowFor360Dialog() {
    window.open(
      `https://hub.360dialog.com/dashboard/app/${partnerId}/permissions?redirect_url=${window.location.protocol}//${window.location.host}/${i18n.language}/redirect-360dialog&state=${partnerId}`,
      "",
      "width=600,height=900"
    );
  }

  useEffect(() => {
    window.addEventListener("storage", () => {
      if (
        localStorage.getItem(LOCALSTORAGE_PUBLIC_API_KEY) !== clientAPIKey &&
        clientAPIKey === null
      ) {
        setClientAPIKey(localStorage.getItem(LOCALSTORAGE_PUBLIC_API_KEY));
      }
    });
  }, [clientAPIKey]);

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.officialStart.way.newNumber.header")}
        subheader={t("onboarding.officialStart.way.newNumber.subheader")}
      />
      <div className={styles.checkboxContainer}>
        <Checkbox
          checked={isEnabledTwoFactor}
          label={t("form.createWhatsapp.requestAPI.haveEnabledTwoAuth")}
          onChange={() => setIsEnabledTwoFactor(!isEnabledTwoFactor)}
        />
      </div>
      <div className={styles.description}>
        <Trans
          i18nKey={
            "form.createWhatsapp.requestAPI.description.enabledTwoAuthSteps"
          }
        >
          Please check the{" "}
          <a
            className={styles.link}
            href="https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/apply-via-360dialog/turn-on-2fa-on-facebook-account"
            target="_blank"
            rel="noreferrer noopener"
          >
            steps
          </a>{" "}
          to enable the Two-Factor Authentication (2FA)
        </Trans>
      </div>
      {isEnabledTwoFactor && (
        <>
          <div className={styles.header}>
            {t("form.createWhatsapp.requestAPI.description.createSteps.header")}
          </div>
          <p className={styles.text}>
            1.{" "}
            {t(
              "form.createWhatsapp.requestAPI.description.createSteps.newNumber.step1"
            )}
          </p>
          <TickedList
            items={t<string[]>(
              "form.createWhatsapp.requestAPI.description.createSteps.newNumber.items",
              { returnObjects: true }
            )}
          />

          <div className={styles.actionsInline}>
            <Button onClick={popupWindowFor360Dialog} as="span" primary>
              <>
                {t("form.createWhatsapp.requestAPI.action.signupAt360Dialog")}
                <i
                  className={`${iconStyles.icon} ${styles.icon} ${styles.externalLink}`}
                />
              </>
            </Button>
            <Button
              onClick={showTutorial}
              content={t("form.createWhatsapp.requestAPI.action.watchTutorial")}
            />
          </div>
          {clientAPIKey && (
            <Create360DialogForm
              clientAPIKey={clientAPIKey}
              onSuccess={props.onSuccess}
            />
          )}
          {isTutorialVisible && (
            <CreateAccountTutorial onClose={hideTutorial} />
          )}
        </>
      )}
    </div>
  );
}
