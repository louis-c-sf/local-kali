import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import React from "react";
import styles from "./DisabledToSendMessage.module.css";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

interface DisabledMessageType {
  content: string;
  link: {
    route: string;
    text: string;
  };
}

export function DisabledToSendMessage(props: { message: DisabledMessageType }) {
  const { message } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <div className={styles.content}>{message.content}</div>
      <div className={styles.action}>
        <Link
          className={"ui button primary feedback-button"}
          to={message.link.route}
        >
          {message.link.text}
        </Link>
        <a
          className={styles.link}
          target={"_blank"}
          rel="noopener noreferrer"
          href={getWhatsAppSupportUrl(
            "Hi SleekFlow. I'd like to learn more about the platform."
          )}
        >
          {t("chat.actions.callSupport")}
        </a>
      </div>
    </div>
  );
}
