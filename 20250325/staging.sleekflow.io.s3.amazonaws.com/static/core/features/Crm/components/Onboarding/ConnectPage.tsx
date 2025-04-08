import React from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import styles from "./ConnectPage.module.css";
import { Button } from "component/shared/Button/Button";
import iconStyles from "component/shared/Icon/Icon.module.css";
import { ProviderType } from "../../API/Onboarding/contracts";
import StepHeader from "../StepHeader/StepHeader";
import { Trans, useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import postInitProvider from "../../API/Onboarding/postInitProvider";

export default function ConnectPage(props: {
  providerType: ProviderType;
  crmName: string;
  docLink: string;
}) {
  const { providerType, crmName, docLink } = props;
  const { t } = useTranslation();
  const location = useLocation();

  const handleConnect = () => {
    try {
      postInitProvider(
        providerType,
        `${window.location.origin}${location.pathname}?step=1`
      ).then((res) => {
        if (res?.context?.salesforceAuthenticationUrl) {
          window.location.href = res.context.salesforceAuthenticationUrl;
        }
        if (res?.context?.hubspotAuthenticationUrl) {
          window.location.href = res.context.hubspotAuthenticationUrl;
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        className={`container ${onboardingStyles.content} ${styles.container}`}
      >
        <StepHeader
          title={crmName}
          provider={providerType}
          subtitle={t("onboarding.crm.stepConnect.subTitle", { crm: crmName })}
        />
        <div className={`${styles.description} ${onboardingStyles.section}`}>
          <Trans
            i18nKey="onboarding.crm.stepConnect.description"
            values={{ crm: crmName }}
          >
            Integrate crm to SleekFlow, allowing you to
            <span className={styles.highlight}>
              share valuable contacts data of customers you collected with other
              systems
            </span>
            . After you create the connection between your crm, you can manage
            conversation,automate workflow and create campaigns based on
            consoliated contacts info.
          </Trans>
        </div>
        <div className={`${styles.listTitle} ${onboardingStyles.section}`}>
          {t("onboarding.crm.stepConnect.needTo")}
        </div>
        <ul className={`${styles.list} ${onboardingStyles.section}`}>
          <li className={styles.listItem}>
            {t("onboarding.crm.stepConnect.grantAccess", { crm: crmName })}
          </li>
        </ul>
        <div className={`${styles.btnWrapper} ${onboardingStyles.section}`}>
          <Button primary customSize="mid" fluid onClick={handleConnect}>
            {t("onboarding.crm.stepConnect.connect", { crm: crmName })}
            <i className={`${iconStyles.icon} ${styles.arrowIcon}`} />
          </Button>
        </div>
        <div className={`${styles.helper} ${onboardingStyles.section}`}>
          {t("onboarding.crm.stepConnect.helper", { crm: crmName })}
        </div>
      </div>
      <div className={styles.footer}>
        <Trans i18nKey="onboarding.crm.stepConnect.footer">
          Not sure about what to do? View our step-by-step guide
          <a target="_blank" rel="noreferrer noopener" href={docLink}>
            here
          </a>
          .
        </Trans>
      </div>
    </>
  );
}
