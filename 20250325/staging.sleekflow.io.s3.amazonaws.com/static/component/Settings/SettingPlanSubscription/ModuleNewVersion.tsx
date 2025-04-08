import { Button } from "component/shared/Button/Button";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./SubscriptionPlanNewVersion.module.css";
export default function ModuleNewVersion({
  moduleName,
}: {
  moduleName: string;
}) {
  const { t } = useTranslation();
  const moduleMapping = {
    salesforce: {
      name: "Salesforce",
      helpCenter: "https://help.sleekflow.io/en_US/salesforce-integration",
      redirectLink: "integrations",
    },
    whatsappBilling: {
      name: "WhatsApp Billing",
      helpCenter: "https://help.sleekflow.io/whatsapp-billing",
      redirectLink: "channels/whatsapp/billing",
    },
  };
  function redirectToV2Setting() {
    window.location.href = `https://${process.env.REACT_APP_V2_PATH}/${moduleMapping[moduleName].redirectLink}`;
  }
  return (
    <div className={`content no-scrollbars`}>
      <div className={`_content ${styles.contentContainer}`}>
        <div className={styles.container}>
          <div className={styles.title}>
            {t("deprecation.title", {
              moduleName: moduleMapping[moduleName].name,
            })}
          </div>
          <div className={styles.group}>
            <div className={styles.content}>
              <Trans
                i18nKey={"deprecation.content"}
                values={{ moduleName: moduleMapping[moduleName].name }}
              >
                A new version of Salesforce is now available. Please click the
                button below to switch to the latest version and enjoy a more
                streamlined user experience with enhanced capabilities in
                SleekFlow 2.0. For any questions or issues during the
                transition, please visit our
                <a href={moduleMapping[moduleName].helpCenter}>Help Center</a>
                for more details or contact our support team.
              </Trans>
            </div>
          </div>
          <div className={styles.action}>
            <Button primary onClick={redirectToV2Setting}>
              {t("deprecation.button.redirect", {
                moduleName: moduleMapping[moduleName].name,
              })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
