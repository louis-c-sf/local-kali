import React from "react";
import styles from "./DeprecationPage.module.css";
import { Button } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import { WEB_VERSION_V2_URL } from "auth/Auth0ProviderWithRedirect";
import { useLocation } from "react-router";
import i18n from "i18n";
export default function DeprecationPage({
  moduleName,
}: {
  moduleName: string;
}) {
  const { language } = i18n;
  const location = useLocation();
  const featureMapping = {
    inbox: "inbox",
    contact: "contacts",
    "contacts/lists": "contacts/list",
    analytics: "analytics/conversations",
    "analytics/sales": "analytics/sales",
  };
  function redirectToV2Feature() {
    const basePath = `${WEB_VERSION_V2_URL}`;
    if (moduleName === "inbox") {
      return `${basePath}/inbox`;
    }
    const foundPathIndex =
      location.pathname.indexOf(featureMapping[moduleName]) === -1
        ? location.pathname.indexOf(moduleName)
        : location.pathname.indexOf(featureMapping[moduleName]);
    const foundPathName = location.pathname.substring(foundPathIndex);
    if (featureMapping[foundPathName]) {
      return `${basePath}/${featureMapping[foundPathName]}`;
    }
    return `${basePath}/${featureMapping[moduleName]}`;
  }
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Trans
            i18nKey={"deprecation.title"}
            values={{ moduleName: moduleName }}
          >
            This version of
            <span className={styles.title}>{{ moduleName: moduleName }}</span>
            is no longer available
          </Trans>
        </div>
        <div className={styles.content}>
          <Trans
            i18nKey={"deprecation.content"}
            values={{ moduleName: moduleName }}
          >
            A new version of
            <span className={styles.title}>{{ moduleName: moduleName }}</span>
            is now available. Please click the button below to switch to the
            latest version and enjoy a more streamlined user experience with
            enhanced capabilities in SleekFlow 2.0. For any questions or issues
            during the transition, please visit our{" "}
            <a
              className={styles.link}
              target="_blank"
              rel="noreferrer noopener"
              href="https://help.sleekflow.io"
            >
              Help Center
            </a>{" "}
            for more details or contact our support team.
          </Trans>
        </div>
        <div className={styles.action}>
          <a
            className={styles.button}
            href={redirectToV2Feature()}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button primary>{t("deprecation.button.redirect")}</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
