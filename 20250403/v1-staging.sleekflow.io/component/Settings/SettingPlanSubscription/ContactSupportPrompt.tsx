import React from "react";
import { useTranslation } from "react-i18next";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";
import styles from "./ContactSupportPrompt.module.css";

export const ContactSupportPrompt = ({
  title,
  children,
  contactSupportMessage,
}: {
  children: React.ReactNode;
  contactSupportMessage: string;
  title: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className={styles.contactSupportHeaderHelpSection}>
      <div className={styles.contactSupportTitleLabel}>{title}</div>
      <div className={styles.contactSupportNeedHelp}>{children}</div>
      <a
        href={getWhatsAppSupportUrl(contactSupportMessage)}
        target={"_blank"}
        rel="noreferrer nofollow"
      >
        {t("settings.plan.subscriptions.contactSupport")}
      </a>
    </div>
  );
};
